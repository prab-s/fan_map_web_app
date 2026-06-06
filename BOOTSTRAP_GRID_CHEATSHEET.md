# Bootstrap Grid Cheat Sheet

This is a quick reference for the grid classes used in the customer-facing templates, especially image galleries and card layouts.

## Core Idea

- `row` creates a horizontal grid container
- `col-*` controls how much width each item takes
- Bootstrap uses a 12-column system
- When the column widths add up to 12, they fill one row

## What `col-12 col-sm-6` Means

For a gallery item:

- `col-12` means full width on extra-small screens
- `col-sm-6` means half width starting at the `sm` breakpoint

So this gives:

- phone-sized screens: 1 image per row
- small screens and larger: 2 images per row

## Common Column Widths

- `col-12` = 100% width
- `col-6` = 50% width
- `col-4` = 33.3% width
- `col-3` = 25% width

## Common Breakpoints

- `sm` = 576px and up
- `md` = 768px and up
- `lg` = 992px and up
- `xl` = 1200px and up
- `xxl` = 1400px and up

## Useful Patterns For Image Galleries

### One image per row

```html
<div class="col-12">
```

### Two images per row on small screens and up

```html
<div class="col-12 col-sm-6">
```

### Three images per row on large screens and up

```html
<div class="col-12 col-md-6 col-lg-4">
```

### Four images per row on large screens and up

```html
<div class="col-12 col-sm-6 col-lg-3">
```

## How To Think About It On This Page

If the goal is:

- stacked on mobile
- 2 across on tablets
- 3 across on desktops

Use something like:

```html
<div class="col-12 col-sm-6 col-xl-4">
```

If the goal is:

- stacked on mobile
- always 2 across once there is room

Use:

```html
<div class="col-12 col-sm-6">
```

## Rule Of Thumb

- Start with `col-12` for mobile friendliness
- Add wider breakpoints only when the content still reads well
- For images, `object-fit: contain` and a fixed-height wrapper usually help keep the grid tidy
