import { registerRootComponent } from "expo";

import App from "./App";
import { registerNotificationResponseTask } from "./services/notificationBackgroundTask";

registerRootComponent(App);

// Defined in the module above, which the background runtime loads on its own.
registerNotificationResponseTask();
