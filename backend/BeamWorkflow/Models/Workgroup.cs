using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BeamWorkflow.Models;

[Table("Workgroups")]
public class Workgroup
{
    [Key]
    [Required]
    public string WorkgroupId { get; set; } = string.Empty;

    [StringLength(40)]
    [Required]
    public string WorkgroupName { get; set; } = string.Empty;

    [StringLength(10_000)]
    [Required]
    public string Description { get; set; } = string.Empty;

    [ForeignKey("User")]
    [EmailAddress]
    [Required]
    public string CreatedBy { get; set; } = string.Empty;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}