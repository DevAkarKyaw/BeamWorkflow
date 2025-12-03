namespace BeamWorkflow.Models.Dtos;

public class GeneralResponseDto
{
    public string Title { get; set; } = "None";

    public string Message { get; set; } = "No Message...";

    public object Dto { get; set; } = new object();
}