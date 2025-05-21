
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  useEffect(() => {
    document.title = "Technical Support Workflow Tracker";
  }, []);

  // Just redirect to the dashboard or login page
  return <Navigate to="/dashboard" replace />;
};

export default Index;
