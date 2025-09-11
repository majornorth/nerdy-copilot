// Runtime conversion of TeX/LaTeX to standalone SVG using MathJax v3.
// Returns an SVG string and a convenience File factory for insertion as an image.

export async function latexToSvg(latex: string, display: boolean = true): Promise<string> {
  const mj = await import('mathjax-full/js/mathjax.js');
  const texModule = await import('mathjax-full/js/input/tex.js');
  const svgModule = await import('mathjax-full/js/output/svg.js');
  const adaptorModule = await import('mathjax-full/js/adaptors/liteAdaptor.js');
  const handlerModule = await import('mathjax-full/js/handlers/html.js');
  const allPkgsModule = await import('mathjax-full/js/input/tex/AllPackages.js');

  const adaptor = adaptorModule.liteAdaptor();
  handlerModule.RegisterHTMLHandler(adaptor);

  const { AllPackages } = allPkgsModule;
  const tex = new texModule.TeX({ packages: AllPackages });
  const svg = new svgModule.SVG({ fontCache: 'none' });
  const html = mj.mathjax.document('', { InputJax: tex, OutputJax: svg });

  const node = html.convert(latex, { display, em: 16, ex: 8, containerWidth: 80 * 16 });
  const svgOutput = adaptor.outerHTML(node);
  return svgOutput;
}

export async function latexToSvgFile(latex: string, display: boolean = true): Promise<File> {
  const svg = await latexToSvg(latex, display);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const file = new File([blob], 'equation.svg', { type: 'image/svg+xml' });
  return file;
}

