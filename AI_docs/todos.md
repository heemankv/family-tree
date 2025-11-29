## Completed

- [x] highlight me (the person creating this website) always with something marker !
  - Added amber-colored "You" badge with star icon to PersonNode and CoupleNode
  - Card has subtle amber border and background tint

- [x] if i select a person, highlight the lines that connect them to their parents and children
  - Edges to parents and children of selected person are highlighted in blue
  - Uses `highlighted-edge` CSS class with thicker stroke

- [x] the photo to detail ratio in the small card is not proper, make the image smaller
  - Reduced avatar sizes: sm from w-8 to w-6, md from w-12 to w-9
  - Text remains the same size for better readability

- [x] the app routing is still available if I don't select a person, remove the routing in that case
  - Clicking empty canvas deselects person
  - Deselecting navigates back to "/" (home)
  - Selection changes update URL properly

- [x] create a dark theme, it should be subtle nothing fancy, don't use hard black rather go with shades of gray
  - Added theme toggle button in header (sun/moon icons)
  - Uses CSS variables for all colors
  - Dark theme uses subtle grays (#1A1A1A, #242424, #2A2A2A)
  - Persists preference to localStorage
  - Respects system preference on first visit
