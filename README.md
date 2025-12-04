# BeamWorkflow

## Deploying Back-end (ASP.NET)

### Step 1: Publish the ASP.NET first

***1. Publish your project locally***

From your project root directory:

```bash
dotnet publish -c Release -o ./publish
This will generate a /publish folder containing:
```

- Your MyApp.dll
- All your compiled dependencies
- Your appsettings.json, static files, views (if any), etc.

Example structure:

```text
publish/
│
├── MyApp.dll
├── appsettings.json
├── wwwroot/
├── Views/ (if MVC)
├── other DLLs
```

***2. Upload the publish folder to your VPS***

You can use any method:

Option A: Using scp (from your local machine)

```bash
scp -r ./publish username@your-vps-ip:/var/www/myapp
```

Option B: Using FileZilla

- Host: your VPS IP
- Port: 22
- Protocol: SFTP
- Username/password
- Upload to /var/www/myapp or similar location

***3. Ensure .NET Runtime is installed on VPS***

Log in to your VPS:

```bash
ssh username@your-vps-ip
```

Then check .NET runtime:

```bash
dotnet --list-runtimes
```

If it's missing, install the ASP.NET Core Runtime (NOT SDK) for Linux:

```bash
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --runtime aspnetcore --channel 8.0
```

***4. Run the app***

Navigate to your deployed folder:

```bash
cd /var/www/myapp
dotnet MyApp.dll
```

Replace MyApp.dll with your actual filename (look in the publish/ folder).

### Step 2: Deploy the Database (EF Core)

***1) Generate the bundle***

```bash
# dotnet ef migrations bundle --self-contained -r <YourTargetRuntimeIdentifier>

dotnet ef migrations bundle --self-contained -r linux-64
```

***2) Copy the bundle on the VPS***

After the command completes, a new executable file will be in the bin/Release/netX.0/<YourTargetRuntimeIdentifier>/publish folder.

Or, if it is not in that location, it would be in the same location as `Startup.cs` or `Program.cs`.

Transfer this file to your VPS using SCP, FTP, or another file transfer method.

***3) Run the bundle on the VPS***

```bash
# Option 1: Using the connection string from appsettings.json
./efbundle

# Option 2: Passing the connection string via command line
./efbundle --connection "Server=...;Database=...;User Id=...;Password=...;"
```

---

## Deploying Front-end (React JS)

### Step 1: Build (compile) the project

***1) Make sure the app runs locally***

Before deploying:

```bash
npm install
npm run dev
```

Fix any errors/warnings in the console first.

***2) Build the production bundle***

From your project root:

Vite

```bash
npm run build
# output goes to: dist/
```

This folder `dist` is what you actually deploy.

### Step 2: Deploy the built project

After building the project, move files and folders inside the `dist` into the ASP.NET folder `wwwroot`.

---
