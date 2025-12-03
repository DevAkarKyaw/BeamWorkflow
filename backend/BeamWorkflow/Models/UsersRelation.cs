using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BeamWorkflow.Models;

[Table("UsersRelations")]
public class UsersRelation
{
    [Key, Required]
    public string RelationId { get; set; } = Guid.NewGuid().ToString();

    [ForeignKey("Workgroup"), Required]
    public string RelatedWorkgroupId { get; set; } = string.Empty;
    
    [ForeignKey("User"), EmailAddress, Required]
    public string CreatedBy { get; set; } = string.Empty;

    [ForeignKey("User"), EmailAddress, Required]
    public string SeniorEmail { get; set; } = string.Empty;

    [ForeignKey("User"), EmailAddress, Required]
    public string JuniorEmail { get; set; } = string.Empty;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? Senior { get; set; }
    public User? Junior { get; set; }
}