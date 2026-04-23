## Markdown stuff

**Requirement:** Must install 'pandoc'.

To produce a .pdf

    pandoc test.md -o test.pdf

Headers
    
    # Header 1
    ## Header 2
    ### Header 3 

will output
# Header 1
## Header 2
### Header 3 
    
and so on.

Inline math

    $x = y$

Centered math

    $$x = y$$

## Reveal.js specific

First clone the directory

    git clone https://github.com/alexanfl/uio/mdstuff

To make a html presentation with reveal.js

    pandoc -t revealjs --template reveal.js-master/revealjs.template -s -V theme="serif" -V transition="slide" test.md -o reveal.js-master/test.html

The different themes can be found in *reveal.js-master/css/theme/*, and
look in the html template *reveal.js-master/revealjs.template* to find the
transitions. (Or just google it …)

### Making 2d slides

'# Horizontal title 1' gives a horizontal slide, 
and for each consecutive '## Vertical title X',

the slideshow goes downwards. A new '# Horizontal title 2' gives a
new slide to the right of 'Horizontal title 1'.
