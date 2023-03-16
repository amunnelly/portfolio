const { DateTime } = require("luxon");
const markdownIt = require('markdown-it');
const markdownItAttrs = require('markdown-it-attrs');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const shell = require('shelljs')
const embedYouTube = require("eleventy-plugin-youtube-embed");
const mathjaxPlugin = require("eleventy-plugin-mathjax");


const markdownItOptions = {
    html: true,
    breaks: true,
    linkify: true
  };

const markdownLib = markdownIt(markdownItOptions).use(markdownItAttrs);

const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt, sizes) {
  let metadata = await Image(src, {
    widths: [300, 600],
    formats: ["avif", "jpeg"]
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };
  shell.exec('mkdir -p docs/img')
  shell.exec('cp img/* docs/img')  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {
    
    eleventyConfig.addPassthroughCopy("./src/css");
    eleventyConfig.addWatchTarget("./src/css");
    eleventyConfig.addPassthroughCopy("./src/fav");
    
    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);

    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
      });

    eleventyConfig.addFilter("slicer", (array, start, finish)=>{
        return array.slice(start, finish);
    });

    //smarten up the markdown: https://dev.to/giulia_chiola/add-html-classes-to-11ty-markdown-content-18ic
    eleventyConfig.setLibrary('md', markdownLib);

    eleventyConfig.addShortcode('tag', (arg) => `<div>${arg}</div>`);

    eleventyConfig.addShortcode('getNotebook', (arg) => `<iframe src="${arg}">`);

    eleventyConfig.addPlugin(embedYouTube);

    eleventyConfig.addPlugin(mathjaxPlugin);




    return {
        dir: {
            input: "src",
            output: "docs",
        }
    };
};