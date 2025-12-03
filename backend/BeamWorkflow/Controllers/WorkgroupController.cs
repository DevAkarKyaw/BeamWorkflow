using Microsoft.AspNetCore.Mvc;
// BEAM WORKFLOW NAMESPACES
using BeamWorkflow.Data;
using BeamWorkflow.Models;
// DTOs
using BeamWorkflow.Models.Dtos;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.Design.Serialization;

namespace BeamWorkflow.Controllers;

[Route("api/[controller]")]
public class WorkgroupController : BeamWorkflowBaseController
{
    protected readonly BeamWorkflowContext Context;

    public WorkgroupController(BeamWorkflowContext context) : base(context)
    {
        Context = context;
    }


    // ====================================================================================================================
    // | WORKGROUP RELATED APIS |
    // ==========================


    // CREATE NEW WORKGROUP
    [HttpPost]
    public async Task<IActionResult> CreateWorkgroup([FromForm] WorkgroupCreateDto workgroupCreateDto)
    {
        // 1) Checking if the "workGroupCreateDto.CreatedBy" email was already signed up or not.
        if (!await IsEmailTaken(workgroupCreateDto.CreatedBy))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{workgroupCreateDto.CreatedBy} is not signed up yet."
            });
        }

        // This is the Stage of all above Rules are satisfied
        // Generating Group Id and Created Date Time
        string groupId = Guid.NewGuid().ToString();
        DateTime dateTimeNow = DateTime.UtcNow;

        var newWorkGroup = new Workgroup()
        {
            WorkgroupId = groupId,
            WorkgroupName = workgroupCreateDto.WorkGroupName,
            Description = workgroupCreateDto.Description,
            CreatedBy = workgroupCreateDto.CreatedBy,
            CreatedAt = dateTimeNow,
            UpdatedAt = dateTimeNow
        };

        var newGpMember = new WorkgroupMemberList()
        {
            WorkgroupId = groupId,
            MemberEmail = workgroupCreateDto.CreatedBy,
            AddedBy = workgroupCreateDto.CreatedBy,
            Role = "admin",
            CreatedAt = dateTimeNow,
            UpdatedAt = dateTimeNow
        };

        await _dbcontext.Workgroups.AddAsync(newWorkGroup);
        await _dbcontext.WorkgroupMemberList.AddAsync(newGpMember);
        await _dbcontext.SaveChangesAsync();

        return Ok(new GeneralResponseDto()
        {
            Message = $"{workgroupCreateDto.WorkGroupName} was created successfully!",
        });
    }


    // GET WORKGROUP OVERVIEW INOFRMATIONS
    [HttpGet("overviews")]
    public async Task<IActionResult> GetWorkgroupOverviewInfos([FromQuery] string userEmail)
    {
        // 1) Checking if the `userEmail` was already signed up or not.
        if (!await IsEmailTaken(userEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{userEmail} is not signed up yet."
            });
        }

        // This is the Stage of above condition is Satisfied.
        var workgroupOverviews_ = await _dbcontext.WorkgroupMemberList
                                        .Where(wgml => wgml.MemberEmail == userEmail)
                                        .Select(wgml => new
                                        {
                                            wgml.WorkgroupId,
                                            wgml.Workgroup!.WorkgroupName,
                                            wgml.Role,
                                            wgml.Workgroup!.CreatedAt
                                        })
                                        .ToListAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = workgroupOverviews_
        });
    }


    // GET WORKGROUP DETAILED INOFRMATIONS
    [HttpGet("details")]
    public async Task<IActionResult> GetWorkgroupDetailInfos([FromQuery] string workgroupId)
    {
        // 1) Checking if the `workgroupId` exists or not.
        if (!await IsWorkgroupExist(workgroupId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{workgroupId} does not exist."
            });
        }

        // This is the Stage of above condition is Satisfied.
        var workgroup_ = await _dbcontext.WorkgroupMemberList
                        .Where(wgml => wgml.WorkgroupId == workgroupId)
                        .Select(wgml => new
                        {
                            wgml.WorkgroupId,
                            wgml.Workgroup!.WorkgroupName,
                            wgml.Workgroup!.Description,
                            wgml.Workgroup!.CreatedAt,
                            wgml.Workgroup!.UpdatedAt,
                            wgml.Role
                        })
                        .FirstOrDefaultAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = workgroup_!
        });
    }


    // UPDATE WORKGROUP INFORMATION
    [HttpPut]
    public async Task<IActionResult> UpdateWrokgroup([FromForm] WorkgroupUpdateDto workgroupUpdateDto)
    {
        // 1) Checking if the `workgroupUpdateDto.Email` was already signed up or not.
        // 2) Checking if the `workgroupUpdateDto.Password` is correct or not.
        if (!await VerifyUser(workgroupUpdateDto.UpdatedBy, workgroupUpdateDto.Password))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "User verification error."
            });
        }

        // 3) Checking if the `workgroupUpdateDto.WorkGroupId` exists or not.
        if (!await IsWorkgroupExist(workgroupUpdateDto.WorkgroupId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{workgroupUpdateDto.WorkgroupId} does not exist."
            });
        }

        // 4) Checking if the `workgroupUpdateDto.UpdatedBy` is admin or assistant admin of the workgroup.
        if (!await IsAdminOrAssistantAdminOfGroup(workgroupUpdateDto.WorkgroupId, workgroupUpdateDto.UpdatedBy))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"Only admin and assistant admin can update the workgroup."
            });
        }

        // This is the Stage of all above conditions are Satisfied.
        DateTime updatedAt = DateTime.UtcNow;

        var workgroup_ = await _dbcontext.Workgroups
                        .FirstOrDefaultAsync(wg => wg.WorkgroupId == workgroupUpdateDto.WorkgroupId);

        if (workgroup_ != null)
        {
            switch (workgroupUpdateDto.ToUpdate)
            {
                case "title":
                    workgroup_.WorkgroupName = workgroupUpdateDto.UpdateValue;
                    break;
                case "description":
                    workgroup_.Description = workgroupUpdateDto.UpdateValue;
                    break;
            }

            workgroup_.UpdatedAt = updatedAt;
        }

        await _dbcontext.SaveChangesAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = new
            {
                updatedAt
            }
        });
    }


    // DELETE WORKGROUP
    [HttpDelete]
    public async Task<IActionResult> DeleteWorkgroup([FromQuery] string workgroupId, [FromQuery] string deletedBy, [FromQuery] string password)
    {
        // 1) Checking if the "workgroupId" exists or not.
        if (!await _dbcontext.Workgroups.AnyAsync(wg => wg.WorkgroupId == workgroupId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{workgroupId} does not exist."
            });
        }

        // 2) Checking if the `deletedBy` email was already signed up or not.
        // 3) Checking if the `password` is correct or not.
        if (!await VerifyUser(deletedBy, password))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "User verification error."
            });
        }

        // 4) Checking if the "deletedBy" is group admin or not.
        if (!await IsAdminOrAssistantAdminOfGroup(workgroupId, deletedBy))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "You are not admin of the group."
            });
        }

        // This is the all conditions are Satisfied Stage.
        await _dbcontext.Workgroups
            .Where(wg => wg.WorkgroupId == workgroupId)
            .ExecuteDeleteAsync();

        // Also delete all the data in workgroup members list and user relations related to the workgroup
        // Delete all relations where either side is a member of the workgroup
        await _dbcontext.UsersRelations
            .Where(ur => ur.RelatedWorkgroupId == workgroupId)
            .ExecuteDeleteAsync();

        // Then delete the members themselves
        await _dbcontext.WorkgroupMemberList
            .Where(m => m.WorkgroupId == workgroupId)
            .ExecuteDeleteAsync();

        // Also delete all the works that are related to the workgroup
        await _dbcontext.Works
            .Where(w => w.RelatedWorkgroupId == workgroupId)
            .ExecuteDeleteAsync();

        await _dbcontext.SaveChangesAsync();

        return Ok();
    }


    // ====================================================================================================================
    // | WORKGROUP MEMBER RELATED APIS |
    // =================================


    // ADD MEMBER TO WORKGROUP
    [HttpPost("new_member")]
    public async Task<IActionResult> AddUserToWorkgroup([FromForm] WorkgroupNewMemberDto workgroupNewMemberDto)
    {
        // 1) Checking if the `workgroupNewMemberDto.MemberEmail` was signed in or not.
        if (!await IsEmailTaken(workgroupNewMemberDto.MemberEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{workgroupNewMemberDto.MemberEmail} is not signed up."
            });
        }

        // 2) Checking if the `workgroupNewMemberDto.AddedBy` is email of Admin or Assistant Admin or not.
        //    Cannot be added member if not admin or assistant admin.
        if (!await IsAdminOrAssistantAdminOfGroup(workgroupNewMemberDto.WorkgroupId, workgroupNewMemberDto.AddedBy))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "Cannot be added member."
            });
        }

        // --------------------------------------------------

        DateTime createdAt = DateTime.UtcNow;

        var newWorkgroupMember = new WorkgroupMemberList()
        {
            WorkgroupId = workgroupNewMemberDto.WorkgroupId,
            MemberEmail = workgroupNewMemberDto.MemberEmail,
            AddedBy = workgroupNewMemberDto.AddedBy,
            Role = workgroupNewMemberDto.Role,
            CreatedAt = createdAt,
            UpdatedAt = createdAt
        };

        var newMemberRelation = new UsersRelation()
        {
            RelatedWorkgroupId = workgroupNewMemberDto.WorkgroupId,
            CreatedBy = workgroupNewMemberDto.AddedBy,
            SeniorEmail = workgroupNewMemberDto.AddedBy,
            JuniorEmail = workgroupNewMemberDto.MemberEmail,
            CreatedAt = createdAt
        };

        await _dbcontext.WorkgroupMemberList.AddAsync(newWorkgroupMember);
        await _dbcontext.UsersRelations.AddAsync(newMemberRelation);
        await _dbcontext.SaveChangesAsync();

        var workgroupMember_ = await _dbcontext.WorkgroupMemberList
                                .Where(wgml => wgml.MemberEmail == workgroupNewMemberDto.MemberEmail)
                                .Select(wgml => new
                                {
                                    wgml.WorkgroupId,
                                    wgml.MemberEmail,
                                    wgml.Role,
                                    wgml.MemberUser!.Username,
                                    wgml.MemberUser!.UserImage
                                })
                                .FirstOrDefaultAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = workgroupMember_!
        });
    }


    // GET WORKGROUPS INFORMAITON AND MEMEBER OF THAT WORKGROUPS
    // this data will be used in creating works in client side
    [HttpGet("workgroups_and_members")]
    public async Task<IActionResult> GetWorkgroupsAndMemberOfIt([FromQuery] string userEmail)
    {
        // 1) Cecking if `userEmail` was signed up or not.
        if (!await IsEmailTaken(userEmail))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This [{userEmail}] is not signed up yet."
            });
        }

        // --------------------------------------------------

        var workgroups_ = await _dbcontext.WorkgroupMemberList
                            .Where(wgml => wgml.MemberEmail == userEmail)
                            .Select(wgml => new
                            {
                                wgml.WorkgroupId,
                                wgml.Workgroup!.WorkgroupName
                            })
                            .ToListAsync();

        var juniors_ = await _dbcontext.UsersRelations
                        .Where(ur => ur.SeniorEmail == userEmail)
                        .Select(ur => new
                        {
                            ur.RelatedWorkgroupId,
                            ur.JuniorEmail,
                            ur.Junior!.Username
                        })
                        .ToListAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = new
            {
                workgroups = workgroups_,
                juniors = juniors_
            }
        });
    }


    // GET MEMBERS OF THE WORKGROUP
    [HttpGet("members")]
    public async Task<IActionResult> GetMembers([FromQuery] string workgroupId)
    {
        // 1) Checking if `workgroupId` exists or not.
        if (!await IsWorkgroupExist(workgroupId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"Workgroup [{workgroupId}] does not exist."
            });
        }

        // --------------------------------------------------

        var members_ = await _dbcontext.WorkgroupMemberList
                        .Where(wgml => wgml.WorkgroupId == workgroupId)
                        .Select(wgml => new
                        {
                            wgml.WorkgroupId,
                            wgml.MemberEmail,
                            wgml.Role,
                            wgml.MemberUser!.Username,
                            wgml.MemberUser!.UserImage
                        })
                        .ToListAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = members_!
        });
    }


    [HttpGet("juniors")]
    public async Task<IActionResult> getJuniors([FromQuery] string workgroupId, [FromQuery] string userEmail)
    {
        // 1) Checking if `workgroupId` exists or not.
        if (!await IsWorkgroupExist(workgroupId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"Workgroup [{workgroupId}] does not exist."
            });
        }

        // --------------------------------------------------

        var juniors_ = await _dbcontext.UsersRelations
                        .Where(ur => ur.RelatedWorkgroupId == workgroupId && ur.SeniorEmail == userEmail)
                        .Select(ur => new
                        {
                            ur.JuniorEmail,
                            ur.Junior!.Username
                        })
                        .ToListAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = juniors_
        });
    }


    // UPDATE MEMBER ROLE OF THE WORKGROUP
    [HttpPut("member")]
    public async Task<IActionResult> UpdateMemberRole([FromQuery] string updatedTo, [FromQuery] string updatedBy, [FromQuery] string role, [FromQuery] string workgroupId)
    {
        // 1) Checking if `workgroupId` is exists or not.
        if (!await IsWorkgroupExist(workgroupId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"Workgroup [{workgroupId}] does not exist."
            });
        }

        // 2) Checking if `updatedBy` is email of Admin or not.
        //    Only admin can modify the role of members.
        if (!await IsAdminOrAssistantAdminOfGroup(workgroupId, updatedBy, checkBoth: false))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "Only admin can change roles."
            });
        }

        // 3) Checking if `role` is valid or not.
        string[] roles = { "admin", "assist_admin", "member" };
        if (!roles.Contains(role))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "Invalid member role."
            });
        }

        // --------------------------------------------------

        var workgroupMember = await _dbcontext.WorkgroupMemberList
                                .FirstOrDefaultAsync(wgm => wgm.MemberEmail == updatedTo && wgm.WorkgroupId == workgroupId);

        if (workgroupMember != null) workgroupMember.Role = role;
        await _dbcontext.SaveChangesAsync();

        return Ok();
    }


    // REMOVE MEMBER FROM THE WORKGROUP
    [HttpDelete("member")]
    public async Task<IActionResult> RemoveMemberFromWorkgroup([FromQuery] string workgroupId, [FromQuery] string removedBy, [FromQuery] string emailToRemove)
    {
        // 1) Checking if `workgroupId` exists or not.
        if (!await IsWorkgroupExist(workgroupId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "Incorrect Workgroup ID."
            });
        }

        // 2) Checking if `emailToRemove` is Admin email or not.
        //    Cannot be removed admin.
        if (await IsAdminOrAssistantAdminOfGroup(workgroupId, emailToRemove, checkBoth: false))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "Admin cannot be removed."
            });
        }

        // 3) Checking if `removedBy` is email of Admin or Assistant Admin or not.
        //    Cannot be removed member if not admin or assistant admin.
        if (!await IsAdminOrAssistantAdminOfGroup(workgroupId, removedBy))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "Member cannot be remove."
            });
        }

        // --------------------------------------------------

        await _dbcontext.WorkgroupMemberList
            .Where(gpml => gpml.MemberEmail == emailToRemove && gpml.WorkgroupId == workgroupId)
            .ExecuteDeleteAsync();

        // Also delete the users' relations
        await _dbcontext.UsersRelations
            .Where(ur => ur.RelatedWorkgroupId == workgroupId && (ur.SeniorEmail == emailToRemove || ur.JuniorEmail == emailToRemove))
            .ExecuteDeleteAsync();

        await _dbcontext.SaveChangesAsync();

        return Ok();
    }
}