
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export const SettingsPage = () => {
  const navigate = useNavigate();
  
  const handlePasswordChange = () => {
    navigate("/change-password");
  };
  
  const handleClearData = () => {
    toast.info("This would clear cached data in a real application");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Configure application behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Clear Cache</p>
              <p className="text-sm text-muted-foreground">
                Clear locally cached data
              </p>
            </div>
            <Button variant="outline" onClick={handleClearData}>Clear Data</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="font-medium">Tech Support Workflow Tracker</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Version 1.0.0
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            This application helps support staff manage customer cases efficiently.
            Track support case lifecycle, filter by lead number and date, and update
            status and customer remarks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
