# Polices auto-hébergées

Déposez ici :

- `Neufreit-ExtraBold.woff2` ← **format à privilégier** (2 à 3× plus léger, chargement bien plus rapide sur mobile)
- `Neufreit-ExtraBold.otf` ← accepté en repli si vous n'avez que l'OTF

Le `@font-face` est déjà déclaré dans `src/index.css` et pointe sur ces deux
chemins, dans cet ordre. Aucun code à modifier : il suffit de poser le fichier.

## Convertir l'OTF en WOFF2

Sans rien installer : https://cloudconvert.com/otf-to-woff2

En ligne de commande (Google woff2) :

```sh
woff2_compress Neufreit-ExtraBold.otf   # produit Neufreit-ExtraBold.woff2
```

## Tant que le fichier est absent

La pile de polices retombe sur **Outfit 800** (Google Fonts, chargé dans
`index.html`), la géométrique libre la plus proche de Neufreit. Le rendu reste
cohérent, simplement un peu moins large. Attendez-vous à un 404 sur
`/fonts/Neufreit-ExtraBold.woff2` dans la console tant que le fichier n'est pas
déposé — c'est sans conséquence sur l'affichage.

Neufreit n'existe qu'en ExtraBold : ne jamais ajouter `font-bold` / `font-black`
par-dessus, cela déclenche un gras synthétique très laid. Le poids 800 est déjà
appliqué par `.font-display`.
