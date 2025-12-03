using Microsoft.AspNetCore.Mvc;
// BEAM WORKFLOW NAMESPACES
using BeamWorkflow.Data;
using BeamWorkflow.Models;
// DTOs
using BeamWorkflow.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace BeamWorkflow.Controllers;

[Route("api/[controller]")]
public class WorkController : BeamWorkflowBaseController
{
    protected readonly BeamWorkflowContext Context;

    public WorkController(BeamWorkflowContext context) : base(context)
    {
        Context = context;
    }

    // ====================================================================================================================
    // | WORK RELATED APIS | 
    // =====================

    // CREATE NEW WORK
    [HttpPost]
    public async Task<IActionResult> CreateWork([FromForm] WorkCreateDto workCreateDto)
    {
        // 1) Check if the `workCreateDto.CreatedBy` email was already signed up or not.
        if (!await IsEmailTaken(workCreateDto.CreatedBy))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{workCreateDto.CreatedBy} is not signed up yet."
            });
        }

        // This is the Stage of above condition is Satisfied
        // Generating Work Id and Created Date Time
        string workId = Guid.NewGuid().ToString();
        DateTime dateTime = DateTime.UtcNow;

        var newWork = new Work()
        {
            WorkId = workId,
            Title = workCreateDto.Title,
            Description = workCreateDto.Description,
            CreatedBy = workCreateDto.CreatedBy,
            AssignedTo = workCreateDto.AssignedTo,
            RelatedWorkgroupId = workCreateDto.RelatedWorkgroupId,
            Seen = false,
            Priority = workCreateDto.Priority.ToLower(),
            CreatedAt = dateTime,
            UpdatedAt = dateTime,
            DueDate = workCreateDto.DueDate,
        };

        await _dbcontext.Works.AddAsync(newWork);
        await _dbcontext.SaveChangesAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = new
            {
                workId,
                createdAt = dateTime,
                updatedAt = dateTime
            }
        });
    }


    // GET WORK OVERVIEW INFORMATIONS
    [HttpGet("overviews")]
    public async Task<IActionResult> GetOverviewWork([FromQuery] string email)
    {
        // 1) Checking if the `email` was already signed up or not.
        if (!await IsEmailTaken(email))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "User verificaion error."
            });
        }

        // This is the stage of above condition is satisfied.
        var workOverview_ = await _dbcontext.Works
                            .Where(w => w.CreatedBy == email || w.AssignedTo == email)
                            .Select(w => new
                            {
                                w.WorkId,
                                w.RelatedWorkgroupId,
                                w.Title,
                                w.CreatedBy,
                                w.CreatedAt, 
                                w.AssignedTo,
                                w.Priority,
                                w.IsCompleted,
                                w.Seen,
                                CreatedByUser = w.CreatedByUser!.Username,
                                AssignedToUser = w.AssignedToUser!.Username
                            })
                            .ToListAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = workOverview_
        });
    }


    // GET WORK DETAILED INFORMATIONS
    [HttpGet("details")]
    public async Task<IActionResult> GetDetailWork([FromQuery] string workId, [FromQuery] string email)
    {
        // 1) Checking if the `workId` exists or not.
        if (!await IsWorkExist(workId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This {workId} does not exist."
            });
        }

        // 2) Checking if the `email` was already signed up or not.
        if (!await IsEmailTaken(email))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This {email} is not signed up yet."
            });
        }

        // This is the stage of above condition is satisfied.
        var workDetail_ = await _dbcontext.Works
                    .Where(w => w.WorkId == workId)
                    .Select(w => new
                    {
                        w.WorkId,
                        w.RelatedWorkgroupId,
                        w.Title,
                        w.Description,
                        w.UpdatedAt,
                        w.CreatedAt,
                        w.CreatedBy,
                        w.AssignedTo,
                        w.Priority,
                        w.Seen,
                        w.IsCompleted,
                        w.CompletedAt,
                        w.DueDate,
                        CreatedByUser = w.CreatedByUser!.Username,
                        AssignedToUser = w.AssignedToUser!.Username
                    })
                    .FirstOrDefaultAsync();

        var work_ = await _dbcontext.Works
                    .FirstOrDefaultAsync(w => w.WorkId == workId);
        if (work_ != null && work_.AssignedTo == email) work_.Seen = true;
        await _dbcontext.SaveChangesAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = workDetail_!
        });
    }


    // UPDATE WORK INFORMATIONS
    [HttpPut]
    public async Task<IActionResult> UpdateWork([FromForm] WorkUpdateDto workUpdateDto)
    {
        // 1) Checking if the `workUpdateDto.WorkId` exists or not.
        if (!await IsWorkExist(workUpdateDto.WorkId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This {workUpdateDto.WorkId} does not exist."
            });
        }

        // 2) Checking if the `workUpdateDto.UpdatedBy` email was already signed up or not.
        if (!await IsEmailTaken(workUpdateDto.UpdatedBy))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This {workUpdateDto.UpdatedBy} is not signed up yet."
            });
        }

        // This is the stage of all above conditions are satisfied.
        DateTime updatedAt = DateTime.UtcNow;
        var work_ = await _dbcontext.Works
                    .FirstOrDefaultAsync(work => work.WorkId == workUpdateDto.WorkId);
        if (work_ != null)
        {
            switch (workUpdateDto.ToUpdate.ToLower())
            {
                case "title":
                    work_.Title = workUpdateDto.UpdateValue;
                    break;
                case "description":
                    work_.Description = workUpdateDto.UpdateValue;
                    break;
                case "assignedto":
                    work_.AssignedTo = workUpdateDto.UpdateValue;
                    break;
                case "priority":
                    work_.Priority = workUpdateDto.UpdateValue.ToLower();
                    break;
                case "duedate":
                    work_.DueDate = DateTime.Parse(workUpdateDto.UpdateValue);
                    break;
            }

            work_.UpdatedAt = updatedAt;
        }
        await _dbcontext.SaveChangesAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = new
            {
                updatedAt
            }
        });
    }


    // WORK DONE
    [HttpPatch("done")]
    public async Task<IActionResult> WorkDone([FromQuery] string workId, [FromQuery] string email)
    {
        // 1) Checking if the `workId` exists or not
        if (!await IsWorkExist(workId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This {workId} does not exist."
            });
        }

        // 2) Checking if the user's `email` was already signed up ot not.
        if (!await IsEmailTaken(email))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"This {email} is not signed up yet."
            });
        }

        // This is the stage of all above conditions are satisfied.
        DateTime completedAt = DateTime.UtcNow;

        var work_ = await _dbcontext.Works
                    .FirstOrDefaultAsync(work => work.WorkId == workId);
        if (work_ != null)
        {
            work_.IsCompleted = true;
            work_.CompletedAt = completedAt;
        }
        await _dbcontext.SaveChangesAsync();

        return Ok(new GeneralResponseDto()
        {
            Dto = new
            {
                completedAt
            }
        });
    }


    // DELETE WORK
    [HttpDelete]
    public async Task<IActionResult> DeleteWork([FromQuery] string workId, [FromQuery] string deletedBy)
    {
        // 1) Checking if the `workId` exists or not.
        if (!await IsWorkExist(workId))
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = $"{workId} does not exist."
            });
        }

        var work_ = await _dbcontext.Works.FirstOrDefaultAsync(w => w.WorkId == workId);

        // 2) Checking if the `deletedBy` is the creator of the work or not.
        if (work_ != null && work_.CreatedBy != deletedBy)
        {
            return BadRequest(new GeneralResponseDto()
            {
                Message = "This work is not created by you."
            });
        }

        // ------------------------------------------

        if (work_ != null) _dbcontext.Works.Remove(work_);
        await _dbcontext.SaveChangesAsync();

        return Ok();
    }
}