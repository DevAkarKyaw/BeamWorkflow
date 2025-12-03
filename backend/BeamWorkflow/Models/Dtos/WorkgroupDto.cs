using System.ComponentModel.DataAnnotations;


namespace BeamWorkflow.Models.Dtos;


public class WorkgroupBaseDto
{
    public const int IdLength = 40;
    public const int TitleLength = 50;
    public const int DescriptionLength = 10_000;
}


public class WorkgroupCreateDto : WorkgroupBaseDto
{
    [StringLength(TitleLength)]
    public string WorkGroupName { get; set; } = "My Work Group";

    [StringLength(DescriptionLength)]
    public string Description { get; set; } = "No descriptions....";

    [EmailAddress, Required]
    public string CreatedBy { get; set; } = string.Empty;
}


public class WorkgroupUpdateDto : WorkgroupBaseDto
{
    [StringLength(TitleLength), Required]
    public string ToUpdate { get; set; } = string.Empty;

    [StringLength(DescriptionLength), Required]
    public string UpdateValue { get; set; } = string.Empty;

    [Required]
    public string WorkgroupId { get; set; } = string.Empty;

    [EmailAddress, Required]
    public string UpdatedBy { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


public class WorkgroupNewMemberDto : WorkgroupBaseDto
{
    [StringLength(IdLength), Required]
    public string WorkgroupId { get; set; } = string.Empty;

    [EmailAddress, Required]
    public string MemberEmail { get; set; } = string.Empty;

    [EmailAddress, Required]
    public string AddedBy { get; set; } = string.Empty;

    public string Role { get; set; } = "member";
}
