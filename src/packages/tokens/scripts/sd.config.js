import StyleDictionary from 'style-dictionary';

// Converts shadow object { offsetX, offsetY, blur, spread, color } → CSS box-shadow string.
StyleDictionary.registerTransform({
	name: 'shadow/css',
	type: 'value',
	filter: (token) => token.$type === 'shadow',
	transform: (token) => {
		const v = token.$value ?? token.value;
		const shadows = Array.isArray(v) ? v : [v];
		return shadows
			.map(
				({ offsetX, offsetY, blur, spread, color }) =>
					`${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`,
			)
			.join(', ');
	},
});

// Adds "px" to raw number values for dimension tokens (e.g. 4 → "4px").
// Values that are already 0 stay as "0" (unitless is valid CSS).
StyleDictionary.registerTransform({
	name: 'size/px',
	type: 'value',
	filter: (token) => token.$type === 'dimension',
	transform: (token) => {
		const val = token.$value ?? token.value;
		return val === 0 ? '0' : `${val}px`;
	},
});

// Adds "ms" to raw number values for duration tokens (e.g. 200 → "200ms").
// Values that are already 0 stay as "0" (unitless is valid CSS for transition-duration).
StyleDictionary.registerTransform({
	name: 'time/ms',
	type: 'value',
	filter: (token) => token.$type === 'duration',
	transform: (token) => {
		const val = token.$value ?? token.value;
		return val === 0 ? '0' : `${val}ms`;
	},
});

export default {
	log: {
		warnings: 'warn',
		verbosity: 'verbose',
		errors: {
			brokenReferences: 'throw',
		},
	},
	source: [
        'tokens/primitives.json',
        'tokens/semantic-global.json',
        'tokens/semantic-light.json',
        'tokens/component.json',
    ],
	platforms: {
		css: {
			transforms: [
				'attribute/cti',
				'name/kebab',
				'color/css',
				'size/px',
				'time/ms',
				'shadow/css',
			],
			prefix: '',
			buildPath: './',
			files: [
				{
					destination: 'build/css/tokens.css',
					format: 'css/variables',
                    filter: (token) => token.filePath.includes('primitives'),
					options: {
						selector: ':root',
						outputReferences: false,
					},
				},
				{
					destination: 'build/css/semantic-global.css',
					format: 'css/variables',
                    filter: (token) => token.filePath.includes('semantic-global'),
					options: {
						selector: ':root',
						outputReferences: false,
					},
				},
				{
					destination: 'build/css/component.css',
					format: 'css/variables',
                    filter: (token) => token.filePath.includes('component'),
					options: {
						selector: ':root',
						outputReferences: true,
					},
				},
			],
		},
	},
};
