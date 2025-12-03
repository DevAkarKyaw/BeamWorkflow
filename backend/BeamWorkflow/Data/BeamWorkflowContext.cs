using Microsoft.EntityFrameworkCore;
using BeamWorkflow.Models;

namespace BeamWorkflow.Data;

public class BeamWorkflowContext : DbContext
{
    public BeamWorkflowContext(DbContextOptions<BeamWorkflowContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<UsersRelation> UsersRelations { get; set; } = null!;
    public DbSet<Work> Works { get; set; } = null!;
    public DbSet<Workgroup> Workgroups { get; set; } = null!;
    public DbSet<WorkgroupMemberList> WorkgroupMemberList { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // base.OnModelCreating(modelBuilder);

        // Tell EF that Email is the key in User
        modelBuilder.Entity<User>()
            .HasKey(u => u.Email);

        modelBuilder.Entity<Workgroup>()
            .HasKey(wg => wg.WorkgroupId);

        modelBuilder.Entity<UsersRelation>()
            .HasOne(r => r.Senior)
            .WithMany()
            .HasForeignKey(r => r.SeniorEmail)
            .HasPrincipalKey(u => u.Email);

        modelBuilder.Entity<UsersRelation>()
            .HasOne(ur => ur.Junior)
            .WithMany()
            .HasForeignKey(ur => ur.JuniorEmail)
            .HasPrincipalKey(u => u.Email);

        modelBuilder.Entity<WorkgroupMemberList>()
            .HasOne(wgml => wgml.MemberUser)
            .WithMany()
            .HasForeignKey(wgml => wgml.MemberEmail)
            .HasPrincipalKey(u => u.Email);

        modelBuilder.Entity<WorkgroupMemberList>()
            .HasOne(wgml => wgml.AddedByUser)
            .WithMany()
            .HasForeignKey(wgml => wgml.AddedBy)
            .HasPrincipalKey(u => u.Email);

        modelBuilder.Entity<WorkgroupMemberList>()
            .HasOne(wgml => wgml.Workgroup)
            .WithMany()
            .HasForeignKey(wgml => wgml.WorkgroupId)
            .HasPrincipalKey(wg => wg.WorkgroupId);

        modelBuilder.Entity<Work>()
            .HasOne(w => w.CreatedByUser)
            .WithMany()
            .HasForeignKey(w => w.CreatedBy)
            .HasPrincipalKey(u => u.Email);

        modelBuilder.Entity<Work>()
            .HasOne(w => w.AssignedToUser)
            .WithMany()
            .HasForeignKey(w => w.AssignedTo)
            .HasPrincipalKey(u => u.Email);
    }
}
