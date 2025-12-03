using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BeamWorkflow.Models;


[Table("WorkgroupMemberList")]
public class WorkgroupMemberList
{
    [Key, Required]
    public string MemberId { get; set; } = Guid.NewGuid().ToString();

    [ForeignKey("Workgroup"), Required]
    public string WorkgroupId { get; set; } = string.Empty;

    [ForeignKey("User")]
    [EmailAddress, Required]
    public string MemberEmail { get; set; } = string.Empty;

    [ForeignKey("User"), EmailAddress, Required]
    public string AddedBy { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "member"; // values -> [admin (or) assist_admin (or) member]

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? MemberUser { get; set; }
    public User? AddedByUser { get; set; }
    public Workgroup? Workgroup { get; set; }
}