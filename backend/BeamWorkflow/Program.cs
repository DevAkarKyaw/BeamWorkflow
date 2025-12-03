// third-party packages
using Microsoft.EntityFrameworkCore;
// my packages
using BeamWorkflow.Data;

var builder = WebApplication.CreateBuilder(args);

// Get connection string from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("BeamWorkflowDatabase");
// Register DbContext
builder.Services.AddDbContext<BeamWorkflowContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddControllers();

var app = builder.Build();

// Middleware
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
app.MapControllers();

app.Run();