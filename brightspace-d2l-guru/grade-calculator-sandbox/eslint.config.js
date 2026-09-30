import { browserConfig, setDirectoryConfigs, testingConfig } from 'eslint-config-brightspace';

export default setDirectoryConfigs(
	browserConfig,
	{ test: testingConfig }
);
