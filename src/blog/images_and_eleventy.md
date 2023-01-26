---
layout: blog.njk
title: Images and Eleventy
slug: Hacking, cutting and battering trying to get the <code>11ty image plugin</code> to work.
date: 2023-01-27
---
Getting the official `11ty image plugin` to work took me something like ten days and an embarrassing amount of outrageously bad language. I don't know why I had to change the parts that I had to change, and neither do I understand how other tutorials seem to make the thing work when I could not, short of the sawing and hacking detailed anon. All I'm saying is that this is my own `11ty image plugin` truth.

Firstly, I'll detail my own adventures. Then, a brief step-by-step on how I got the thing to work in the end.

## Initial Setup

This is based on the official documentation: <https://www.11ty.dev/docs/plugins/image/>. I started by setting up an [11ty](https://www.11ty.dev/) site as usual, with this standard, recognisable initial configuration.

~~~sh
.
├── node_modules
├── package-lock.json
├── package.json
└── src
    ├── _includes
    │   └── base.njk
    ├── css
    │   └── style.css
    └── index.md
~~~

And that's all great. Next I installed the plugin:

~~~shell
npm i -D @11ty/eleventy-img
~~~

And added some code to `.eleventy.js` to make the thing work:

~~~javascript
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
  }

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function(eleventyConfig) {
  // earlier code here
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);
};
~~~

What the code does is detailed in the documentation. There's nothing I can add to that.

Next, I created an index page, `index.md`, and called an image like so:

&#123;% image "./src/images/bond.png", "Bond, James Bond", "(min-width: 30em) 50vw, 100vw" %&#125;

This followed the documentation recipe exactly, with one exception:  I used a picture of Seán Connery in [Goldfinger](https://www.imdb.com/title/tt0058150/?ref_=nv_sr_srsg_0), wearing the most beautiful suit I've ever seen, rather than some mangy cat. Someday, I hope to own a suit like that. Besides; it's my tutorial, and I can do what I like.

{% image "./src/img/bond.png", "Bond, James Bond", "(min-width: 30em) 50vw, 100vw" %}


So, here are the files as they were before I ran the program to assemble the site for the first time:

~~~sh
├── node_modules
├── package-lock.json
├── package.json
└── src
    ├── _includes
    │   └── base.njk
    ├── css
    │   └── style.css
    ├── images
    │   └── bond.png
    └── index.md
~~~

There was only one page in my website, `index.md`, and its only purpose is to show a picture of Sean Connery in *Goldfinger*, enjoying his mint julep. I typed `npm start`, I hit <kbd>Enter</kbd>, and I navigated to http://localhost:8000 to see how the thing has turned out.

There was no sign of Bond. He was missing in action.

## What Happened to Bond? Had SPECTRE Got Him at Last?

But this wasn't my first rodeo. I right-clicked and chose `Inspect`, and found this code where 007 ought to be.

~~~html
<picture>
  <source type="image/avif" srcset="/img/jAjwboTfhA-300.avif 300w, /img/jAjwboTfhA-600.avif 600w"
          sizes="(min-width: 30em) 50vw, 100vw">
  <source type="image/jpeg" srcset="/img/jAjwboTfhA-300.jpeg 300w, /img/jAjwboTfhA-600.jpeg 600w"
          sizes="(min-width: 30em) 50vw, 100vw"><img alt="Bond, James Bond" loading="lazy" decoding="async"
                                                     src="/img/jAjwboTfhA-300.jpeg" width="600" height="338">
</picture>
~~~

The code is looking for a directory called `img`, which doesn't exist. There is no reference to an `images` directory as per the example in the documentation.

OK. Let's change `images` to `img`. That's not hard. And we'll change the call in `index.md` to match:


&#123;% image "./src/img/bond.png", "Bond, James Bond", "(min-width: 30em) 50vw, 100vw" %&#125;	

That didn't work either. 😞

OK. I'm not panicking. I've been doing this a while now. I've picked up a thing or two along the way. It's not mentioned in the documentation, so maybe there's something missing. I looked at the default code, and noticed this mysterious construction:

~~~javascript
eleventyConfig.addPassthroughCopy("./src/css");
~~~

Two can play at that game. I added

~~~javascript
eleventyConfig.addPassthroughCopy("./src/img");
~~~

And ran the thing again. Nothing. No Bond, no nothing. Now, I started getting annoyed. I looked at the setup of the folders, to see if my `img` directory has been copied successfully:

~~~sh
.
├── img
│   ├── jAjwboTfhA-300.avif
│   ├── jAjwboTfhA-300.jpeg
│   ├── jAjwboTfhA-600.avif
│   └── jAjwboTfhA-600.jpeg
├── node_modules
├── package-lock.json
├── package.json
├── public
│   ├── css
│   │   └── style.css
│   ├── img
│   │   └── bond.png # Bond, James Bond, is right here!
│   └── index.html
└── src
    ├── _includes
    │   └── base.njk
    ├── css
    │   └── style.css
    ├── img
    │   └── bond.png
    └── index.md
~~~

Yes, it has - look at it in the `public` directory, just where it ought to be.

But hold on a second. What in the name of sufferin' succotash is that `img` directory doing in the root directory?

## Mystery Solved

The funky file names contained in this new `img` directory, newly-discovered in our root directory like a Stargate or some other artefact from beyond the known world, suggests that `img` directory is in fact the `img` directory that should exist as part of our `public` directory but, for some reason, doesn't.

So at least we know what happened. The next question is: what to do about it?

## Pass the Hacksaw, Alice

I don't know what anyone else should do, but this is what I did. I revved up Google and tracked an `npm` package that would give me bash-scripting ability. This is the package I found: https://www.npmjs.com/package/shelljs. I installed it:

~~~sh
npm i shelljs
~~~

And I then added three lines to `.eleventy.js` that would

1. Create a `shelljs` object, called `shell`;
2. Use my `shell` object to create an `img` directory in the `public` directory if it doesn't exist already, and
3. Copy all the contents of the root `img` directory, created by the 11ty image plugin, to this new `public/img` directory.

So `.eleventy.js` now looks like this:

~~~javascript
const Image = require("@11ty/eleventy-img");
const shell = require('shelljs') // 1. My shelljs object

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
  }
  
  shell.exec('mkdir -p public/img') // create the directory if it doesn't exist already
  shell.exec('cp img/* public/img') // copy everything from ./img into ./public/img

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("./src/css");
    eleventyConfig.addPassthroughCopy(".img");
    eleventyConfig.addWatchTarget("./src/css/");

    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);

    return {
        dir: {
            input: "src",
            output: "public",
        }
    };
};
~~~

## Questions

And it worked. The images that you see on this site are served quite capably by the 11ty image plug-in, but questions remain.

1. Will shelljs works on Windows? Beats me. I'm counting my blessings that I got it to work on Mac/Linux, and don't feel like pushing my luck.
2. Is `    eleventyConfig.addPassthroughCopy(".img");` really necessary? I don't know, but I'm too scared to move it. It's not like the code is cluttered that much less if I zap it, to be quite frank.
3. How come you have the image plugin set for Nunjucks, Liquid and JavaScript? Again. Too scared not to. In the Kingdom of JavaScript, I try to do as the JavaScripters do.

# And Finally: How to Use The `11ty image plugin`

## Firstly,

Install two packages, `` and ``.

~~~sh
npm i -D @11ty/eleventy-img
npm i shelljs
~~~

## Then,

Add this code to `.eleventy.js`:

~~~javascript
const Image = require("@11ty/eleventy-img");
const shell = require('shelljs') // 1. My shelljs object

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
  }
  
  shell.exec('mkdir -p public/img') // create the directory if it doesn't exist already
  shell.exec('cp img/* public/img') // copy everything from ./img into ./public/img

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("./src/css");
    eleventyConfig.addPassthroughCopy(".img");
    eleventyConfig.addWatchTarget("./src/css/");

    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);

    return {
        dir: {
            input: "src",
            output: "public",
        }
    };
};
~~~

## Finally,

Store images in `src/img`. Call them in templates as

&#123;% image "./src/img/someImage.png", "Description of the image", "(min-width: 30em) 50vw, 100vw" %&#125;	

