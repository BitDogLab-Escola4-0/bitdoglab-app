import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'br.unicamp.ic.bitdoglab',
	appName: 'BitDogLab',
	webDir: 'dist',
	server: {
		androidScheme: 'http',
		cleartext: true,
	},
	android: {
		allowMixedContent: true,
	},
};

export default config;
