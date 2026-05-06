/**
 * Theme-specific Style Dictionary config.
 * We run this twice: once for light, once for dark.
 * Outputs scoped CSS variables that apply only under [data-theme="..."].
 */
import StyleDictionary from 'style-dictionary';

function buildTheme(mode) {
	const sd = new StyleDictionary({
        log: {
            warnings: 'warn',
            verbosity: 'verbose',
            errors: {
                brokenReferences: 'throw' 
            }
	    },
		source: [
			'tokens/primitives.json', // referenced, not emitted — needed for resolution
			`tokens/semantic-${mode}.json`,
            'tokens/component.json'
		],
		platforms: {
			css: {
				transformGroup: 'css',
				buildPath: './',
				files: [
					{
						destination: `build/css/theme-${mode}.css`,
						format: 'css/variables',
						/* Only emit tokens from the semantic file, not the primitives */
						filter: (token) =>
							token.filePath.includes(`semantic-${mode}`),
						options: {
							selector:
								mode === 'light'
									? ':root, [data-theme="light"]'
									: '[data-theme="dark"]',
							outputReferences: false,
						},
					},
				],
			},
		},
	});
	return sd.buildAllPlatforms();
}

await buildTheme('light');
await buildTheme('dark');
