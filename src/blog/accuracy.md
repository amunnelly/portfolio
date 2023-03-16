---
layout: blog.njk
title: Accuracy
slug: Measuring accuracy isn't as straightforward as it seems
date: 2023-03-17
---

Consider a classification problem. You have a group of animals, and you must classify each animal as either a cat or a dog.

There are two ways this could go right, and two ways this could go wrong, make for four possible outcomes.

1. You correctly classify a dog as a dog.
2. You correctly classify a cat as a cat.
3. You incorrectly classify a dog as a cat.
4. You incorrectly classify a cat as a dog.

## Abstracting to Dogs and Not-Dogs

Now. Let's abstract our problem out a little. Let's say you're governed by Sirius, the Dog Star, and to you the entire world is made up of `dogs` and `not-dogs`. This slightly changes your classification problem, because now you're only interested in the dogs. Once something is not a dog, it could be a cat or an elephant. It's all the same to you. So, the adjusted four outcomes are:

1. You correctly classify a `dog` as a `dog`.
2. You correctly classify a `not-dog` as a `not-dog`.
3. You incorrectly classify a `dog` as a `not-dog`.
4. You incorrectly classify a `not-dog` as a `dog`.

## Nomenclature

Let's abstract a little further. Instead of `dogs` and `not-dogs`, let's call the classifications `positive` (oh hurrah - a dog!) and `negative` (dang, it's not a dog), and let's call the judgement of the classifications `true` and `false`. So our nomenclature has morphed like this:

```
dog       -> dog       -> positive
cat       -> not-dog   -> negative
correct   -> correct   -> true
incorrect -> incorrect -> false
```

And we can make a little table of how these things could go that looks like this:

## Confusion Matrix

{% image "./src/img/confusion_matrix/confusion_matrix.svg", "A confusion matrix for measuring classification accuracy", "(min-width: 30em) 50vw, 100vw" %}

These tables are called confusion matrices. Best not to ask why.

## The Problem of Accuracy

Where this gets interesting is with regard to the question of accuracy. `Accuracy`, in theory, is your number of correct predictions expressed as a ratio of your total predictions:

$$ Accuracy=\frac{true\ positives\ +\ true\ negatives}{true\ positives\ +\ false\ positives\ +\ true \ negatives\ +\ false\ negatives} $$

And that's fine, if the world is evenly divided between `dogs` and `not-dogs`. But the world isn't evenly divided between `dogs` and `not-dogs` - for every dog, there are many, many not-dogs. If there are 99 not-dogs for every dog, then you can classify everything as `not-dog` and claim 99% accuracy in your calculation.

This is one of the perpetual problems in statistics, the friction that is inevitable when the perfect world of mathematics meets the less-then-perfect world of material reality.

## Precision and Recall

For which reason, there two other measure of accuracy, `precision` and `recall`.

$$Precision=\frac{true\ positives}{true\ positives\ +\ false\ positives}$$

$$Recall=\frac{true\ positives}{true\ positives\ +\ false\ negatives}$$

In the example above, where everything is classified as `not-dog`, `precision` stays about the same, but `recall` falls through the floor, indicating the flaw in the methodology.

It seems a subtle point, but consider an example other than `dogs` and `not-dogs`. Consider a classification not of animals, but viruses. The amount of viruses in the air is very low, existing in the same ratio as `dogs` to `not-dogs` in the world. But reader, consider what happens if you take a virus like [Ebola](https://www.cdc.gov/vhf/ebola/index.html) or [Marburg](https://www.cdc.gov/vhf/marburg/index.html), and your classifier classifies it as `negative` when it should have been classified `positive` - what then? What use your `accuracy` then, when Death mounts his pale horse to gather his grisly harvest?
