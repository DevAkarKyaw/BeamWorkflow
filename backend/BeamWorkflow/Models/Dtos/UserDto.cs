using System.ComponentModel.DataAnnotations;

namespace BeamWorkflow.Models.Dtos;


public class UserBaseDto
{
    public const int IdLength = 40;
}


public class SignUpReceiveDto
{
    [EmailAddress, Required]
    public string Email { get; set; } = "";

    [StringLength(20)]
    public string Username { get; set; } = "User " + new Random().Next(1000, 9999);

    [Required]
    public string Password { get; set; } = string.Empty;

    [StringLength(7), Required]
    public string Gender { get; set; } = string.Empty;

    public IFormFile? Image { get; set; }
}


public class SignInResponseDto
{
    [EmailAddress]
    public string? Username { get; set; }

    public string? UserImage { get; set; }

    public string? ThemeName { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? Gender { get; set; }
}


public class UserInfoUpdateReceiveDto
{
    [StringLength(20), Required]
    public string ToUpdate { get; set; } = string.Empty;

    [StringLength(100), Required]
    public string UpdateValue { get; set; } = string.Empty;

    [EmailAddress, Required]
    public string UserEmail { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    public IFormFile? UpdateImage { get; set; }
}


public class NewUsersRelationDto : UserBaseDto
{
    [StringLength(IdLength), Required]
    public string WorkgroupId { get; set; } = string.Empty;

    [EmailAddress, Required]
    public string CreatedBy { get; set; } = string.Empty;

    [EmailAddress, Required]
    public string SeniorEmail { get; set; } = string.Empty;

    [EmailAddress, Required]
    public string JuniorEmail { get; set; } = string.Empty;
}