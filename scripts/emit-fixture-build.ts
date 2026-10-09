import { compileSyntheticFixture } from "@african-mandate/data-pipeline";

import fixture from "../tests/fixtures/compilation/synthetic-fixture.json";

const compiled = await compileSyntheticFixture(fixture);
process.stdout.write(JSON.stringify(compiled.canonicalFiles));
