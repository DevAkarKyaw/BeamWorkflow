using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
// BEAM WORKFLOW NAMESPACES
using BeamWorkflow.Data;

// -------------------------------------------------------------------------------------------------
namespace BeamWorkflow.Controllers;

[ApiController]
public class BeamWorkflowBaseController : ControllerBase
{
    // Database Context
    protected readonly BeamWorkflowContext _dbcontext;

    public BeamWorkflowBaseController(BeamWorkflowContext context)
    {
        _dbcontext = context;
    }

    // Default Paths
    protected string ProfileImgPath = Path.Combine("Mediabase", "ProfileImages");
    protected string DefaultProfileImgPath = Path.Combine("Mediabase", "DefaultImages");

    // Utility Method
    protected async Task<bool> VerifyUser(string email, string password)
    {
        var storedPassword = await _dbcontext.Users
            .Where(user => user.Email == email)
            .Select(user => user.Password)
            .FirstOrDefaultAsync();

        // Email not registered
        if (string.IsNullOrEmpty(storedPassword))
            return false;

        // Password check
        return BCrypt.Net.BCrypt.Verify(password, storedPassword);
    }


    // Utility Method
    protected async Task<bool> IsEmailTaken(string email)
    {
        if (await _dbcontext.Users.AnyAsync(user => user.Email == email)) return true;
        return false;
    }

    // Utility Method
    protected async Task<string> SaveImage(IFormFile imageFile, string fileName = "null")
    {
        string imageFileName = "";

        // Create "mediaFolder" directory if not not exists
        if (!Directory.Exists(ProfileImgPath))
            Directory.CreateDirectory(ProfileImgPath);

        // Saving the image
        if (imageFile != null && imageFile.Length > 0)
        {
            var fileExtension = Path.GetExtension(imageFile.FileName);
            Console.WriteLine(fileExtension);

            if (fileName != "null")
            {
                string fileName_ = Path.GetFileNameWithoutExtension(fileName);
                imageFileName = $"{fileName_}{fileExtension}";
            }
            else if (Guid.TryParse(Path.GetFileName(imageFile.FileName), out Guid result))
                imageFileName = $"{result}{fileExtension}";
            else
                imageFileName = $"{Guid.NewGuid()}{fileExtension}";

            var savePath = Path.Combine(ProfileImgPath, imageFileName);
            await using var stream = new FileStream(savePath, FileMode.Create);
            await imageFile.CopyToAsync(stream);
        }

        return imageFileName;
    }

    // Utility Method
    protected IFormFile ConvertImageToIFormFile(string filePath)
    {
        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        return new FormFile(stream, 0, stream.Length, "image", Path.GetFileName(filePath));
    }

    // Utility Method
    protected async Task<bool> IsWorkExist(string workId)
    {
        return await _dbcontext.Works.AnyAsync(w => w.WorkId == workId);
    }

    // Utility Method
    protected async Task<bool> IsWorkgroupExist(string workgroupId)
    {
        return await _dbcontext.Workgroups.AnyAsync(wg => wg.WorkgroupId == workgroupId);
    }

    // Utility Method
    protected async Task<bool> IsAdminOrAssistantAdminOfGroup(string groupId, string userEmail, bool checkBoth = true)
    {
        // This single query correctly handles all logic in one trip to the database.
        return await _dbcontext.WorkgroupMemberList.AnyAsync(wgml =>
            wgml.WorkgroupId == groupId &&
            wgml.MemberEmail == userEmail &&
            (wgml.Role == "admin" || (checkBoth && wgml.Role == "assist_admin"))
        );
    }

    // Utility Method
    protected async Task<bool> IsWorkgroupMember(string email)
    {
        return await _dbcontext.WorkgroupMemberList
            .AnyAsync(wgm => wgm.MemberEmail == email);
    }

    // Utility Method
    protected async Task<bool> IsUserRelationExist(string userEmail_1, string userEmail_2)
    {
        return await _dbcontext.UsersRelations
            .AnyAsync(ur => (ur.SeniorEmail == userEmail_1 && ur.JuniorEmail == userEmail_2) ||
                            (ur.SeniorEmail == userEmail_2 && ur.JuniorEmail == userEmail_1));
    }

    // Utility Method
    protected async Task<bool> IsUserRealtionIdExist(string relationId)
    {
        return await _dbcontext.UsersRelations
            .AnyAsync(ur => ur.RelationId == relationId);
    }
}