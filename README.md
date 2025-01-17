# BeatLeader / Score Saber PP calculator

## Users

Just go to [isitworthplaying.motzel.dev](https://isitworthplaying.motzel.dev)

## Devs

### Install the dependencies

```bash
yarn install
```

### Configure Netlify account

Create a new Netlify project and link it to the forked repo.

#### Install netlify dev CLI

```bash
npm install netlify-cli -g
```

Then start Netlify dev environment

```bash
netlify dev
```

Navigate to [localhost:8888](http://localhost:8888). You should see app running.

### Building and running in production mode

By default, Netlify builds the app after every change to the master branch in the repository, so all you need is

```bash
git push
```

### ... but I don't use Netlify

Check your hosting provider's documentation.

Note that the project uses Netlify redirects to bypass CORS issues in the Beat Savior API and to fetch some of the ScoreSaber subpages (not all data is available in the SS API yet).

Check the contents of [netlify.toml](https://github.com/motzel/scoresaber-reloaded/blob/master/netlify.toml) and see how you can resolve this with your provider.
