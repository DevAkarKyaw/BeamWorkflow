using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BeamWorkflow.Models;

[Table("Users")]
public class User
{
    [Key]
    [EmailAddress]
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [StringLength(20)]
    [Required]
    public string Username { get; set; } = string.Empty;

    [StringLength(7)]
    [Required]
    public string Gender { get; set; } = string.Empty;

    [Required]
    public string UserImage { get; set; } = string.Empty;

    public string ThemeName { get; set; } = "lumen";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
