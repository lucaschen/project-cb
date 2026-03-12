import { AppProviders } from "@app/app/AppProviders";
import { AppRouter } from "@app/app/router";

export const App = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};
