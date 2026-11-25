# SHIFT — Thème Shopify (Online Store 2.0)

Thème premium dark mode pour une marque de **bracelets compatibles WHOOP** : « Un bracelet pour chaque occasion ».
Le nom **SHIFT** est provisoire : modifiez-le dans *Personnaliser > Paramètres du thème > Marque*.
WHOOP est mentionné uniquement comme appareil compatible (aucun logo WHOOP utilisé).

## Pourquoi du Liquid + JavaScript vanilla (et pas React)

L'intégration GitHub de Shopify synchronise les fichiers du dépôt **sans lancer de build**. Le thème est donc 100 % natif :

- Liquid, templates JSON, sections, blocks, paramètres de thème (Online Store 2.0)
- `assets/theme.css` et `assets/theme.js` : aucune compilation, aucune dépendance, aucun serveur
- Panier via l'API AJAX de Shopify, paiement via **Shopify Checkout** (aucun paiement maison)

## Structure

```text
assets/        theme.css, theme.js
config/        settings_schema.json, settings_data.json
layout/        theme.liquid
locales/       fr.default.json
sections/      hero, concept, collection-list, featured-collection, lifestyle,
               featured-product, benefits, testimonials, newsletter, header, footer,
               cart-drawer, main-product, product-recommendations, main-collection,
               main-list-collections, main-cart, main-page, main-search, main-404
snippets/      product-card, buy-box, price, icon, swatch-color, newsletter-form, meta-tags
templates/     index, product, collection, list-collections, cart, page, search, 404 (JSON)
```

## Mise en ligne : GitHub → Shopify

1. **Boutique** : créez-la sur shopify.com, puis ajoutez vos produits (voir plus bas).
2. **Dépôt** : copiez le contenu de ce dossier **à la racine** du dépôt (les dossiers `assets/`, `config/`, `layout/`… doivent être à la racine, pas dans un sous-dossier). Commit, puis push sur `main`.
3. **Connexion** : Shopify Admin > *Boutique en ligne > Thèmes > Ajouter un thème > Connecter depuis GitHub*.
4. Autorisez l'application GitHub de Shopify, choisissez le dépôt, la branche **`main`**, puis *Connecter*.
5. **Prévisualisation** : *Actions > Prévisualiser* sur le thème ajouté.
6. **Publication** : *Actions > Publier*.

### Workflow

```text
Développement local → git commit → git push main → synchronisation Shopify → prévisualisation → publication
```

Limites à connaître :

- Chaque push sur `main` met à jour le thème connecté. Si ce thème est **publié**, la boutique change immédiatement : travaillez sur une branche dédiée (connectée à un thème non publié) puis fusionnez dans `main`.
- Les modifications faites dans l'éditeur de thème sont **réécrites dans le dépôt** (commits automatiques), principalement dans `templates/*.json` et `config/settings_data.json`. Faites un `git pull` avant de retravailler en local pour éviter les conflits.
- Shopify ne compile rien : tout fichier du dépôt doit déjà être final.

## Configuration dans Shopify

- **Produits** : *Produits > Ajouter un produit*. Une option nommée **Couleur** (ou Color / Coloris) affiche des pastilles de couleur.
- **Pastilles** : *Paramètres du thème > Couleurs > Pastilles de coloris*, une ligne par valeur (`Volt Green:#C6FF00`). Le nom doit correspondre exactement à la valeur de l'option.
- **Variantes** : coloris, taille, etc. Prix, stock et images de variante sont synchronisés automatiquement.
- **Badge « Nouveau »** : ajoutez le tag `new` à un produit.
- **Collections** : *Produits > Collections*. Créez Sport, Daily, Night, Color, Premium puis associez-les dans la section *Collections* de l'accueil (image, texte, couleur modifiables). Créez « Best sellers » et sélectionnez-la dans la section du même nom.
- **Navigation** : *Contenu > Menus* : `main-menu` (Shop, Collections, Best sellers, À propos) et `footer`.
- **Pages** (À propos, FAQ, Livraison & retours) : *Contenu > Pages*. Les politiques légales du pied de page viennent de *Paramètres > Politiques*.
- **Compatibilité par produit** (facultatif) : métachamp `custom.compatibility` (texte), sinon le texte global du thème s'affiche.
- **Newsletter** : le formulaire crée un client avec le tag `newsletter` (*Clients*), compatible avec Shopify Email.
- **Visuels** : tous les visuels s'ajoutent depuis l'éditeur (hero, concept, collections, occasions). Sans image, des fonds dégradés s'affichent.
- **Réseaux sociaux** : *Paramètres du thème > Réseaux sociaux*.

## Contenu fictif à remplacer avant publication

- Section **Avis clients** : trois avis marqués `[PLACEHOLDER]` (case « Contenu fictif » dans la section). Remplacez-les ou ajoutez une application d'avis (Judge.me, Loox, Yotpo… via un bloc d'application).
- Aucun produit n'est écrit en dur : tout vient de Shopify. Sans produit, un état vide est affiché.
- Les textes d'avantages sont génériques et ne revendiquent aucune certification, matière ou compatibilité précise.

## Développement local (facultatif)

Prérequis : [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) et un accès à votre boutique.

```bash
shopify theme dev --store votre-boutique.myshopify.com   # aperçu local avec rechargement
shopify theme check                                      # contrôle qualité
```

Aucune variable d'environnement ni secret n'est nécessaire (`.env` est ignoré par Git).

## Accessibilité, performance, SEO

Lien d'évitement, focus visibles, navigation clavier, `prefers-reduced-motion` respecté, images responsives en lazy loading, polices via `font_face` (`font-display: swap`), balises Open Graph, données structurées produit (`structured_data`), sitemap géré par Shopify.
