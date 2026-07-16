# Super Simple Contacts website

Static sales site for the Super Simple Contacts 1.0 App Store launch.

Production: [supersimplecontacts.com](https://supersimplecontacts.com)

Preview from the repository root:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173/Website/`.

The site has no build step or external runtime dependencies. Product screenshots and the app icon are copied into `Website/assets` so the folder can be deployed on its own.

Refresh the website's product images after running the App Store capture pipelines:

```sh
./Scripts/refresh-website-screenshots.sh
```

## Deployment

The repository is connected to Vercel. Pushes to `main` create production deployments. The apex domain and `www` hostname are managed through the Vercel project.
