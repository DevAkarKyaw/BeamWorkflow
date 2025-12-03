using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BeamWorkflow.Models;

[Table("Works")]
public class Work
{
    [Key]
    [Required]
    public string WorkId { get; set; } = string.Empty;

    [ForeignKey("WorkGroup")]
    [Required]
    public string RelatedWorkgroupId { get; set; } = string.Empty; // Foreign key to the WorkGroup this work belongs to

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [ForeignKey("User")]
    [Required]
    public string CreatedBy { get; set; } = string.Empty; // Email of the user who created the work

    [ForeignKey("User")]
    [Required]
    public string AssignedTo { get; set; } = string.Empty; // Email of the user assigned to the work

    [StringLength(6)]
    public string Priority { get; set; } = "low"; // e.g., "low", "medium", "high"

    public bool IsCompleted { get; set; } = false; // Default to false, indicating the work is not completed

    public bool Seen { get; set; } = false;

    public DateTime? CompletedAt { get; set; } // Nullable to allow works that are not completed

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime DueDate { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public User? CreatedByUser { get; set; }
    public User? AssignedToUser { get; set; }
}