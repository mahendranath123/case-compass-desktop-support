
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  useEffect(() => {
    document.title = "Technical Support Workflow Tracker";
  }, []);

  // Direct redirect to dashboard - no delays
  return <Navigate to="/dashboard" replace />;
};

export default Index;
