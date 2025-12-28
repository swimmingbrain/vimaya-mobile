const fs = require("fs");

const focusMode = fs.readFileSync("app/focusmode/FocusMode.tsx", "utf8");

// Update imports
let updated = focusMode.replace(
  "} from \"react-native\";",
  "  Animated,\n} from \"react-native\";"
);

// Add colors import
updated = updated.replace(
  "import type { AppStateStatus } from \"react-native\";",
  "import { colors } from \"@/utils/theme\";\nimport type { AppStateStatus } from \"react-native\";"
);

fs.writeFileSync("app/focusmode/FocusMode.tsx", updated);
console.log("Updated imports");
