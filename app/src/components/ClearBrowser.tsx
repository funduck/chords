import { Button } from "@mantine/core";

function ClearBrowser() {
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the browser? This action cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Button onClick={handleClear} variant="outline">
      Clear Browser
    </Button>
  );
}

export default ClearBrowser;
