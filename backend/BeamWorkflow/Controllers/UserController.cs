using Microsoft.AspNetCore.Mvc;
// BEAM WORKFLOW NAMESPACES
using BeamWorkflow.Data;
using BeamWorkflow.Models;
// DTOs
using BeamWorkflow.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace BeamWorkflow.Controllers;

[Route("api/[controller]")]
public class UserController : BeamWorkflowBaseController
{
    public UserController(BeamWorkflowContext context) : base(context)
    {
    }

    // ====================================================================================================================
    // | AUTHENTICATION RELATED APIS |
    // ===============================


    // SIGN UP USER
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromForm] SignUpReceiveDto signUpReceiveDto)
    {
        // `SignUpResceiveDto` is a form of data that will send from the client.

        // 1) Checking if the `signUpDto.Email` was already signed up or not.
        if (await IsEmailTaken(signUpReceiveDto.Email))
        {
            return BadRequest(new GeneralResponseDto
            {
                Message = $"{signUpReceiveDto.Email} is taken."
            });
        }

        // 2) Saving the `signUpReceiveDto.Image`.
        string imageFileFullName = "";
        if (signUpReceiveDto.Image == null)
        {
            switch (signUpReceiveDto.Gender!.ToLower())
            {
                case "male":
                    string maleImgPath = Path.Combine(DefaultProfileImgPath, "img_male.png");
                    imageFileFullName = await SaveImage(ConvertImageToIFormFile(maleImgPath));
                    break;

                case "female":
                    string femaleImgPath = Path.Combine(DefaultProfileImgPath, "img_female.png");
                    imageFileFullName = await SaveImage(ConvertImageToIFormFile(femaleImgPath));
                    break;
            }
        }
        else
        {
            imageFileFullName = await SaveImage(signUpReceiveDto.Image);
        }

        // 3) Hashing the `signUpReceiveDto.Password`.
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(signUpReceiveDto.Password);

        // 4) Preparing Data to Save in the database
        var newUser = new User
        {
            Email = signUpReceiveDto.Email,
            Username = signUpReceiveDto.Username,
            Password = hashedPassword,
            Gender = signUpReceiveDto.Gender,
            UserImage = imageFileFullName
        };

        await _dbcontext.Users.AddAsync(newUser);
        await _dbcontext.SaveChangesAsync();

        return Ok();
    }


    // SIGN IN USER
    [HttpGet("signin")]
    public async Task<IActionResult> SignIn([FromQuery] string email, [FromQuery] string password)
    {
        // 1) Verify User `email` and `password`.
        if (await VerifyUser(email, password))
        {
            var user_ = await _dbcontext.Users
                        .FirstOrDefaultAsync(user => user.Email == email);

            // `responseDto` is the form of what client will receive 
            var responseDto = new SignInResponseDto()
            {
                Username = user_!.Username,
                UserImage = user_!.UserImage,
                ThemeName = user_!.ThemeName,
                CreatedAt = user_!.CreatedAt,
                Gender = user_!.Gender
            };

            // returning back to client
            return Ok(new GeneralResponseDto()
            {
                Dto = responseDto
            });
        }
        // #) User Verification Failed
        else
        {
            // returning back to client
            return BadRequest(new GeneralResponseDto()
            {
                Message = "Email or Password is incorrect.",
            });
        }
    }


    // DELETE USER
    [HttpDelete]
    public async Task<IActionResult> DeleteUser([FromQuery] string email, [FromQuery] string password)
    {
        // 1) Checking if `email` was already signed in or not
        // 2) Checking if `password` is correct or not
        if (await VerifyUser(email, password))
        {
            // Delete all the related works of this user (if it's created by the user)
            await _dbcontext.Works
                .Where(w => w.CreatedBy == email)
                .ExecuteDeleteAsync();

            // ---------------------

            // Delete the workgroup member lists

            // If the user is admin of that workgroup
            var workgroupIds_ = await _dbcontext.Workgroups
                                .Where(wgml => wgml.CreatedBy == email)
                                .Select(wgml => wgml.WorkgroupId)
                                .ToListAsync();

            workgroupIds_.ForEach(async id =>
            {
                await _dbcontext.WorkgroupMemberList
                    .Where(wgml => wgml.WorkgroupId == id)
                    .ExecuteDeleteAsync();
            });

            // If the user is member of that workgroup
            await _dbcontext.WorkgroupMemberList
                .Where(wgml => wgml.MemberEmail == email)
                .ExecuteDeleteAsync();

            // ---------------------              

            // Delete all the workgroups of this user (if the user is admin)
            await _dbcontext.Workgroups
                .Where(wg => wg.CreatedBy == email)
                .ExecuteDeleteAsync();

            // ---------------------

            // Delete all the user relations of this user
            await _dbcontext.UsersRelations
                .Where(ur => ur.SeniorEmail == email || ur.JuniorEmail == email)
                .ExecuteDeleteAsync();

            // ---------------------

            // Delete this user
            var user_ = await _dbcontext.Users
                        .Where(user => user.Email == email)
                        .FirstAsync();

            // Deleting user image
            string imgPath = Path.Combine(ProfileImgPath, user_!.UserImage);
            System.IO.File.Delete(imgPath);

            _dbcontext.Remove(user_);

            // ---------------------

            await _dbcontext.SaveChangesAsync();

            return Ok();
        }

        return BadRequest(new GeneralResponseDto()
        {
            Message = "User verification failed."
        });
    }


    // ====================================================================================================================
    // | USERS PROFILE RELATED APIS |
    // ==============================


    // UPDATE USER INFORMATIONS
    [HttpPut("user-info")]
    public async Task<IActionResult> UpdateUserInfo([FromForm] UserInfoUpdateReceiveDto userInfoUpdateReceiveDto)
    {
        // `UserInfoUpdateDto` is a form of data that will send from the client.

        // 1) Checking if "userInfoUpdateReceiveDto.userEmail" was already signed up or not.
        // 2) Checking if "userInfoUpdateReceiveDto.password" is correct or not.
        if (!await VerifyUser(userInfoUpdateReceiveDto.UserEmail, userInfoUpdateReceiveDto.Password))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Title = "update failed",
                Message = "User verification error."
            });
        }

        // This is all the conditions are Satisfied Stage.
        var user_ = await _dbcontext.Users
                    .FirstOrDefaultAsync(u => u.Email == userInfoUpdateReceiveDto.UserEmail);

        switch (userInfoUpdateReceiveDto.ToUpdate)
        {
            case "password":
                user_!.Password = BCrypt.Net.BCrypt.HashPassword(userInfoUpdateReceiveDto.UpdateValue);
                break;

            case "username":
                if (userInfoUpdateReceiveDto.UpdateValue.Length < 21)
                    user_!.Username = userInfoUpdateReceiveDto.UpdateValue;
                else
                    user_!.Username = userInfoUpdateReceiveDto.UpdateValue[..20];
                break;

            case "userImage":
                Console.WriteLine(userInfoUpdateReceiveDto.UpdateImage);
                if (userInfoUpdateReceiveDto.UpdateImage != null)
                {
                    string prevImg = Path.Combine(ProfileImgPath, user_!.UserImage);
                    System.IO.File.Delete(prevImg);
                    string imageFileFullName = await SaveImage(userInfoUpdateReceiveDto.UpdateImage, user_!.UserImage);
                    user_.UserImage = imageFileFullName;
                }
                break;

            case "gender":
                user_!.Gender = userInfoUpdateReceiveDto.UpdateValue;
                break;

            case "themeName":
                user_!.ThemeName = userInfoUpdateReceiveDto.UpdateValue;
                break;
        }

        await _dbcontext.SaveChangesAsync();

        if (userInfoUpdateReceiveDto.ToUpdate == "userImage")
        {
            return Ok(new GeneralResponseDto()
            {
                Message = $"{userInfoUpdateReceiveDto.ToUpdate} is {user_!.UserImage} updated",
                Dto = user_.UserImage
            });
        }
        else
        {
            return Ok(new GeneralResponseDto()
            {
                Message = $"{userInfoUpdateReceiveDto.ToUpdate} is updated to {userInfoUpdateReceiveDto.UpdateValue}"
            });
        }
    }


    // ====================================================================================================================
    // | USERS RELATIONS RELATED APIS |
    // ================================


    // CREATE NEW USER RELATION
    [HttpPost("new_relation")]
    public async Task<IActionResult> CreateNewUserRelation([FromForm] NewUsersRelationDto newUsersRelationDto)
    {
        // 1) Checking if `newUsersRelationDto.WorkgroupId` exists or not.
        if (!await IsWorkgroupExist(newUsersRelationDto.WorkgroupId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This workgroup [{newUsersRelationDto.WorkgroupId}] does not exist."
            });
        }

        // 2) Checking if `newUsersRelationDto.AddedBy` is email of Admin or Assistant Admin or not.
        if (!await IsAdminOrAssistantAdminOfGroup(newUsersRelationDto.WorkgroupId, newUsersRelationDto.CreatedBy))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "Cannot create new member relation."
            });
        }

        // 3) Checking if `newUsersRelationDto.SeniorEmail` and `newUsersRelationDto.JuniorEmail` were already signed up or not.
        if (!await IsEmailTaken(newUsersRelationDto.SeniorEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This [{newUsersRelationDto.SeniorEmail}] is not signed up yet."
            });
        }
        else if (!await IsEmailTaken(newUsersRelationDto.JuniorEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This [{newUsersRelationDto.JuniorEmail}] is not signed up yet."
            });
        }

        // 4) Checking if `newUsersRelationDto.SeniorEmail` and `newUsersRelationDto.JuniorEmail` are member of this workgroup or not.
        if (!await IsWorkgroupMember(newUsersRelationDto.SeniorEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This [{newUsersRelationDto.JuniorEmail}] is not member of this workgroup."
            });
        }
        else if (!await IsWorkgroupMember(newUsersRelationDto.JuniorEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This [{newUsersRelationDto.JuniorEmail}] is not member of this workgroup."
            });
        }

        // 5) Checking if the new relation was already created or not.
        if (await IsUserRelationExist(newUsersRelationDto.SeniorEmail, newUsersRelationDto.JuniorEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "This relation was already created."
            });
        }

        // --------------------------------------------------

        var newMemberRelation = new UsersRelation()
        {
            RelatedWorkgroupId = newUsersRelationDto.WorkgroupId,
            CreatedBy = newUsersRelationDto.CreatedBy,
            SeniorEmail = newUsersRelationDto.SeniorEmail,
            JuniorEmail = newUsersRelationDto.JuniorEmail
        };

        await _dbcontext.UsersRelations.AddAsync(newMemberRelation);
        await _dbcontext.SaveChangesAsync();

        return Ok();
    }


    // GET MULTIPLE RELATED USERS
    [HttpGet("relations")]
    public async Task<IActionResult> GetRelatedUsers([FromQuery] string workgroupId, [FromQuery] string userEmail)
    {
        // 1) Checking if the `userEmail` was already signed up or not.
        if (!await IsEmailTaken(userEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "User verification error."
            });
        }

        // -----------------------------------------------------

        var relatedUsers_ = await _dbcontext.UsersRelations
                            .Where(ur =>
                                (ur.RelatedWorkgroupId == workgroupId) &&
                                (ur.CreatedBy == userEmail || ur.SeniorEmail == userEmail || ur.JuniorEmail == userEmail)
                            )
                            .Select(ur => new
                            {
                                ur.RelationId,
                                ur.RelatedWorkgroupId,
                                ur.SeniorEmail,
                                SeniorName = ur.Senior!.Username,
                                SeniorImage = ur.Senior!.UserImage,
                                ur.JuniorEmail,
                                JuniorName = ur.Junior!.Username,
                                JuniorImage = ur.Junior!.UserImage
                            })
                            .ToListAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = relatedUsers_
        });
    }


    // GET SINGLE USERS RELATION
    [HttpGet("relation")]
    public async Task<IActionResult> GetUsersRelation([FromQuery] string seniorEmail, [FromQuery] string juniorEmail)
    {
        // 1) Checking if the `userEmail` was already signed up or not.
        if (!await IsEmailTaken(seniorEmail) || !await IsEmailTaken(juniorEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "User verification error."
            });
        }

        // -----------------------------------------------------

        var relatedUsers_ = await _dbcontext.UsersRelations
                            .Where(ur => ur.SeniorEmail == seniorEmail && ur.JuniorEmail == juniorEmail)
                            .Select(ur => new
                            {
                                ur.RelationId,
                                ur.RelatedWorkgroupId,
                                ur.SeniorEmail,
                                SeniorName = ur.Senior!.Username,
                                SeniorImage = ur.Senior!.UserImage,
                                ur.JuniorEmail,
                                JuniorName = ur.Junior!.Username,
                                JuniorImage = ur.Junior!.UserImage
                            })
                            .FirstOrDefaultAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = relatedUsers_!
        });
    }


    // DELETE THE USER RELATIONS
    [HttpDelete("relation")]
    public async Task<IActionResult> DeleteUsersRelation([FromQuery] string relationId, [FromQuery] string relatedWorkgroupId, [FromQuery] string deletedBy)
    {
        // 1) Checking if the `realtionId` exists or not.
        if (!await IsUserRealtionIdExist(relationId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{relationId} does not exist."
            });
        }

        // 2) Checking if the `relatedWorkgroupId` exists or not.
        if (!await IsWorkgroupExist(relatedWorkgroupId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{relatedWorkgroupId} does not exist."
            });
        }

        // 3) Checking if the `deletedBy` email is admin
        if (!await IsAdminOrAssistantAdminOfGroup(relatedWorkgroupId, deletedBy))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"Only admin can remove the user relations."
            });
        }

        // -----------------------------------------------------

        var userRelation = await _dbcontext.UsersRelations
                            .Where(ur => ur.RelationId == relationId)
                            .ExecuteDeleteAsync();
        await _dbcontext.SaveChangesAsync();

        return Ok();
    }


    // ====================================================================================================================
    // | OTHER RELATED APIS |
    // ======================


    // USER IMAGE REQUEST
    [HttpGet("image")]
    public IActionResult GetUserImage(string imageId)
    {
        var imagePath = Path.Combine(ProfileImgPath, imageId);

        if (!System.IO.File.Exists(imagePath))
            return NotFound();

        var imageFileStream = System.IO.File.OpenRead(imagePath);
        return File(imageFileStream, "image/png");
    }
}