using System.ComponentModel.DataAnnotations;


namespace BeamWorkflow.Models.Dtos;


public class WorkBaseDto
{
    public const int TitleLength = 30;
    public const int DescriptionLength = 10_000;
}


public class WorkCreateDto : WorkBaseDto
{
    public string WorkId { get; set; } = string.Empty;

    [Required]
    [StringLength(TitleLength)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(DescriptionLength)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string CreatedBy { get; set; } = string.Empty;

    [Required]
    public string AssignedTo { get; set; } = string.Empty;

    [Required]
    public string RelatedWorkgroupId { get; set; } = string.Empty;

    [StringLength(6)]
    public string Priority { get; set; } = "low";

    [Required]
    public DateTime CreatedAt { get; set; }

    [Required]
    public DateTime DueDate { get; set; }
}


public class WorkUpdateDto : WorkBaseDto
{
    [Required]
    public string WorkId { get; set; } = string.Empty;

    [EmailAddress, Required]
    public string UpdatedBy { get; set; } = string.Empty;

    [StringLength(20), Required]
    public string ToUpdate { get; set; } = string.Empty;

    [StringLength(DescriptionLength), Required]
    public string UpdateValue { get; set; } = string.Empty;
}
