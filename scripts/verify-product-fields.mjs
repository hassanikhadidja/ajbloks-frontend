/**
 * Verifies product field mapping for dashboard save/load round-trip.
 * Run: node scripts/verify-product-fields.mjs
 */
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { dashboardToProductFields, productToDashboard, parseProductColors } = require(
  "../BACKEND-DEPLOY-main/utils/productMapper.js",
);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const input = {
  name: "Test Color Product",
  price: 999,
  category: "Test",
  description: "Desc",
  age: "3Y+",
  isTrending: true,
  isBook: false,
  hasMultipleColors: true,
  colors: [
    { name: "Red", hex: "#FF0000" },
    { name: "Green", hex: "00FF00" },
    { name: "Blue", hex: "#0000FF" },
  ],
  pictures: ["https://example.com/a.jpg"],
};

const fields = dashboardToProductFields(input);
assert(fields.isTrending === true, "isTrending should be true");
assert(fields.hasMultipleColors === true, "hasMultipleColors should be true");
assert(fields.colors.length === 3, "expected 3 colors");
assert(fields.colors[0].hex === "#FF0000", "color order preserved");
assert(fields.colors[1].hex === "#00FF00", "hex without # normalized");
assert(fields.colors[2].hex === "#0000FF", "third color saved");

const roundTrip = productToDashboard({
  _id: "abc123",
  ...fields,
});
assert(roundTrip.isTrending === true, "round-trip isTrending");
assert(roundTrip.hasMultipleColors === true, "round-trip hasMultipleColors");
assert(roundTrip.colors.length === 3, "round-trip colors count");
assert(roundTrip.colors[1].hex === "#00FF00", "round-trip hex");

const unchecked = dashboardToProductFields({
  ...input,
  isTrending: false,
  hasMultipleColors: false,
  colors: [],
});
assert(unchecked.isTrending === false, "unchecked isTrending");
assert(unchecked.hasMultipleColors === false, "unchecked hasMultipleColors");
assert(unchecked.colors.length === 0, "colors cleared");

const jsonColors = dashboardToProductFields({
  ...input,
  colors: JSON.stringify(input.colors),
});
assert(jsonColors.colors.length === 3, "JSON string colors parsed");

console.log("OK — product field mapping verified");
