
magick  \
    -size 1000x1000  xc:transparent \
    -fill '#ddddfa' \
    -draw "circle 500 500 500 1" \
    -pointsize 400 \
    -gravity center \
    -fill '#0000ff' \
    -draw 'text 0,-150 "♪"' \
    -font './Mcbungus-Regular.ttf' \
    -fill '#3a3a3a' \
    -draw 'text 0,150 "git"' \
    icon_circle.png


magick  \
    -size 1000x1000  xc:transparent \
    -fill '#ddddfa' \
    -draw "rectangle 0,0 1000,1000" \
    -pointsize 300 \
    -gravity center \
    -fill '#0000ff' \
    -draw 'text 0,-120 "♪"' \
    -font './Mcbungus-Regular.ttf' \
    -fill '#3a3a3a' \
    -draw 'text 0,120 "git"' \
    icon_maskable.png


magick icon_maskable.png -resize 512x512! ../public/logo512_maskable.png
magick icon_maskable.png -resize 192x192! ../public/logo192_maskable.png
magick icon_circle.png -resize 512x512! ../public/logo512_circle.png
magick icon_circle.png -resize 192x192! ../public/logo192_circle.png
magick icon_circle.png -define icon:auto-resize="256,128,96,64,48,32,16" ../public/favicon.ico
