# Sufia

## NOTE: This document is written for the not-yet-released beta version of Sufia 7.0.0.  If you are using sufia, you'll want to check out the [6.x stable branch](https://github.com/projecthydra/sufia/tree/6.x-stable) branch and its [README.md](https://github.com/projecthydra/sufia/blob/6.x-stable/README.md) in particular.

Since Sufia 7 is unreleased, not all the documentation has been updated to account for the new code structure. However, you should be able to get a development instance up and running with the following list of steps:

```
git clone git@github.com:projecthydra/sufia.git
cd sufia
bundle install
rake jetty:clean
rake curation_concerns:jetty:config
rake jetty:start
rake engine_cart:generate
cd .internal_test_app
redis-server
RUN_AT_EXIT_HOOKS=true TERM_CHILD=1 resque-pool --daemon --environment development start
rails server
```

After running these steps, browse to http://localhost:3000/ and you should see the application running.

[![Version](https://badge.fury.io/rb/sufia.png)](http://badge.fury.io/rb/sufia)
[![Apache 2.0 License](http://img.shields.io/badge/APACHE2-license-blue.svg)](./LICENSE)
[![Contribution Guidelines](http://img.shields.io/badge/CONTRIBUTING-Guidelines-blue.svg)](./CONTRIBUTING.md)
[![API Docs](http://img.shields.io/badge/API-docs-blue.svg)](http://rubydoc.info/gems/sufia)
[![Build Status](https://travis-ci.org/projecthydra/sufia.png?branch=master)](https://travis-ci.org/projecthydra/sufia)
[![Dependency Status](https://gemnasium.com/projecthydra/sufia.png)](https://gemnasium.com/projecthydra/sufia)
[![Coverage Status](https://coveralls.io/repos/projecthydra/sufia/badge.svg)](https://coveralls.io/r/projecthydra/sufia)
[![Documentation Status](https://inch-ci.org/github/projecthydra/sufia.svg?branch=master)](https://inch-ci.org/github/projecthydra/sufia)
[![Code Climate](https://codeclimate.com/github/projecthydra/sufia/badges/gpa.svg)](https://codeclimate.com/github/projecthydra/sufia)
[![Ready Tickets](https://badge.waffle.io/projecthydra/sufia.png?label=ready&title=Ready)](https://waffle.io/projecthydra/sufia)

# Table of Contents

  * [What is Sufia?](#what-is-sufia)
  * [Help](#help)
  * [Getting started](#getting-started)
    * [Prerequisites](#prerequisites)
      * [Characterization](#characterization)
      * [Derivatives](#derivatives)
    * [Environments](#environments)
    * [Ruby](#ruby)
  * [Creating a Sufia-based app](#creating-a-sufia-based-app)
    * [Rails](#rails)
    * [Sufia's Ruby-related dependencies](#sufias-ruby-related-dependencies)
      * [Pagination](#pagination)
    * [Install Sufia](#install-sufia)
    * [Database tables and indexes](#database-tables-and-indexes)
    * [Solr and Fedora](#solr-and-fedora)
    * [Start background workers](#start-background-workers)
    * [Spin up the web server](#spin-up-the-web-server)
  * [Managing a Sufia-based app](#managing-a-sufia-based-app)
    * [Production concerns](#production-concerns)
      * [Identifier state](#identifier-state)
      * [Web server](#web-server)
      * [Database](#database)
    * [Monitor background workers](#monitor-background-workers)
    * [Audiovisual transcoding](#audiovisual-transcoding)
    * [User interface](#user-interface)
    * [Integration with Dropbox, Box, etc.](#integration-with-dropbox-box-etc)
    * [Analytics and usage statistics](#analytics-and-usage-statistics)
      * [Capturing usage](#capturing-usage)
      * [Displaying usage in the UI](#displaying-usage-in-the-ui)
    * [Zotero integration](#zotero-integration)
    * [Tag Cloud](#tag-cloud)
    * [Customizing metadata](#customizing-metadata)
    * [Admin Users](#admin-users)
      * [One time setup for first admin](#one-time-setup-for-first-admin)
      * [Adding an admin user](#adding-an-admin-user)
    * [Migrating data to PCDM in Sufia 7](#migrating-data-to-pcdm-in-sufia-7)
  * [License](#license)
  * [Contributing](#contributing)
  * [Development](#development)
    * [Regenerating the README TOC](#regenerating-the-readme-toc)
    * [Run the test suite](#run-the-test-suite)
    * [Change validation behavior](#change-validation-behavior)
  * [Acknowledgments](#acknowledgments)

# What is Sufia?

Sufia uses the full power of [Hydra](http://projecthydra.org/) and extends it to provide a user interface around common repository features and social features (see below). Sufia offers self-deposit and proxy deposit workflows with plans to develop one or more mediated deposit workflows in 2016. Sufia delivers its rich and growing set of features via a modern, responsive user interface. It is implemented as a Rails engine, so it is meant to be added to existing Rails apps.

Sufia has the following features:

* Multiple file, or folder, upload
* Flexible user- and group-based access controls
* Transcoding of audio and video files
* Generation and validation of identifiers
* Fixity checking
* Version control
* Characterization of uploaded files
* Forms for batch editing metadata
* Faceted search and browse
* Social media interaction
* User profiles
* User dashboard for file management
* Highlighted files on profile
* Sharing w/ groups and users
* User notifications
* Activity streams
* Background jobs
* Single-use links
* Google Analytics for usage statistics
* Integration w/ cloud storage providers
* Google Scholar-specific metadata embedding
* Schema.org microdata, Open Graph meta tags, and Twitter cards for rich snippets
* User-managed collections for grouping files
* Full-text indexing & searching
* Responsive, fluid, Bootstrap 3-based UI
* Dynamically configurable featured works and researchers on homepage
* Proxy deposit and transfers of ownership
* Integration with Zotero for automatic population of user content

See [Sufia's documentation site](http://sufia.io/) for more information.

# Help

If you have questions or need help, please email [the Hydra community tech list](mailto:hydra-tech@googlegroups.com) or stop by [the Hydra community IRC channel](irc://irc.freenode.net/projecthydra).

# Getting started

This document contains instructions specific to setting up an app with __Sufia
v7.0.0.beta1__ (not yet released). If you are looking for instructions on installing a different
version, be sure to select the appropriate branch or tag from the drop-down
menu above.

## Prerequisites

Sufia requires the following software to work:

1. Solr
1. [Fedora Commons](http://www.fedora-commons.org/) digital repository
1. A SQL RDBMS (MySQL, PostgreSQL), though **note** that SQLite will be used by default if you're looking to get up and running quickly
1. [Redis](http://redis.io/), a key-value store
1. [ImageMagick](http://www.imagemagick.org/) with JPEG-2000 support
1. [FITS](#characterization) version 0.6.x
1. [LibreOffice](#derivatives)

**NOTE: If you do not already have Solr and Fedora instances you can use in your development environment, you may use hydra-jetty (instructions are provided below to get you up and running quickly and with minimal hassle).**

### Characterization

1. Go to http://projects.iq.harvard.edu/fits/downloads and download a copy of FITS (be sure to get version 0.6.2) & unpack it somewhere on your machine.
1. Mark fits.sh as executable (`chmod a+x fits.sh`)
1. Run "fits.sh -h" from the command line and see a help message to ensure FITS is properly installed
1. Give your Sufia app access to FITS by:
    1. Adding the full fits.sh path to your PATH (e.g., in your .bash_profile), **OR**
    1. Changing `config/initializers/sufia.rb` to point to your FITS location:  `config.fits_path = "/<your full path>/fits.sh"`

### Derivatives

Install [LibreOffice](https://www.libreoffice.org/). If `which soffice` returns a path, you're done. Otherwise, add the full path to soffice to your PATH (in your .bash_profile, for instance). On OSX, soffice is **inside** LibreOffice.app. Your path may look like "/<your full path to>/LibreOffice.app/Contents/MacOS/"

## Environments

Note here that the following commands assume you're setting up Sufia in a development environment (using the Rails built-in development environment). If you're setting up a production or production-like environment, you may wish to tell Rails that by prepending `RAILS_ENV=production` to the commands that follow, e.g., `rails`, `rake`, `bundle`, and so on.

## Ruby

First, you'll need a working Ruby installation. You can install this via your operating system's package manager -- you are likely to get farther with OSX, Linux, or UNIX than Windows but your mileage may vary -- but we recommend using a Ruby version manager such as [RVM](https://rvm.io/) or [rbenv](https://github.com/sstephenson/rbenv).

We recommend either Ruby 2.2 or the latest 2.1 version.

# Creating a Sufia-based app

## Rails

Generate a new Rails application.  Sufia 7 requires Rails 4.2.

```
gem install rails -v 4.2
rails new my_app
```

## Sufia's Ruby-related dependencies

Add the following lines to your application's Gemfile.

```
gem 'sufia', '7.0.0.beta1' # NOT YET RELEASED
gem 'kaminari', github: 'jcoyne/kaminari', branch: 'sufia'  # required to handle pagination properly in dashboard. See https://github.com/amatsuda/kaminari/pull/322
```

Then install Sufia as a dependency of your app via `bundle install`

### Pagination

The line with kaminari -- a Ruby library that helps build pagination into applications -- listed as a dependency in the Gemfile is a temporary fix to address a
[known problem](https://github.com/amatsuda/kaminari/pull/322) in the current release of kaminari.

## Install Sufia

Install Sufia into your app using its built-in install generator. This step adds a number of files that Sufia requires within your Rails app, including e.g. a number of database migrations.

```
rails generate sufia:install -f
```

## Database tables and indexes

Now that Sufia's required database migrations have been generated into your app, you'll need to load them into your application's database.

```
rake db:migrate
```

## Solr and Fedora

If you already have instances of Solr and Fedora that you would like to use, you may skip this step. Otherwise feel free to use [hydra-jetty](https://github.com/projecthydra/hydra-jetty), the bundled copy of Jetty, a Java servlet container that is configured to run versions of Solr and Fedora that are known to work with Sufia. Hydra-jetty (since v8.4.0) requires Java 8.

The following rake tasks will install hydra-jetty and start up Jetty with Solr and Fedora.

```
rake jetty:clean
rake curation_concerns:jetty:config
rake jetty:start
```

## Start background workers

Sufia uses a queuing system named Resque to manage long-running or slow processes. Resque relies on the [Redis](http://redis.io/) key-value store, so [Redis](http://redis.io/) must be installed *and running* on your system in order for background workers to pick up jobs.

Unless Redis has already been started, you will want to start it up. You can do this either by calling the `redis-server` command, or if you're on certain Linuxes, you can do this via `sudo service redis-server start`.

Next you will need to start up the Resque workers provided by Sufia. The following command will run until you stop it, so you may want to do this in a dedicated terminal.

```
RUN_AT_EXIT_HOOKS=true TERM_CHILD=1 QUEUE=* rake environment resque:work
```

Or, if you prefer (e.g., in production-like environments), you may want to set up a `config/resque-pool.yml` -- [here is a simple example](https://github.com/projecthydra/sufia/blob/master/sufia/lib/generators/sufia/templates/config/resque-pool.yml) -- and run resque-pool which will manage your background workers in a dedicated process.

```
RUN_AT_EXIT_HOOKS=true TERM_CHILD=1 resque-pool --daemon --environment development start
```

Occasionally, Resque may not give background jobs a chance to clean up temporary files. The `RUN_AT_EXIT_HOOKS` variable allows Resque to do so. The `TERM_CHILD` variable allows workers to terminate gracefully rather than interrupting currently running workers. For more information on the signals that Resque responds to, see the [resque-pool documentation](https://github.com/nevans/resque-pool#signals).

See https://github.com/defunkt/resque for more options. If you use resque-pool, you may also be interested in a shell script to help manage it. [Here is an example](https://github.com/psu-stewardship/scholarsphere/blob/develop/script/restart_resque.sh) which you can adapt for your own needs.

## Spin up the web server

To test-drive your new Sufia application, spin up the web server that Rails provides:

`rails server`

And now you should be able to browse to http://localhost:3000/ and see the application. Note that this web server is purely for development purposes; you will want to use a more fully featured [web server](#web-server) for production-like environments.

# Managing a Sufia-based app

This section provides tips for how to manage, customize, and enhance your Sufia application.

## Production concerns

In production or production-like (e.g., staging) environments, you may want to make changes to the following areas.

### Identifier state

Sufia uses the ActiveFedora::Noid gem to mint (Noid)[https://confluence.ucop.edu/display/Curation/NOID]-style identifiers -- short, opaque identifiers -- for all user-created content (including `GenericWorks`, `FileSets`, and `Collections`). The identifier minter is stateful, meaning that it keeps track of where it is in the sequence of minting identifiers so that the minter can be "replayed," for example in a disaster recovery scenario. ([Read more about the technical details](https://github.com/microservices/noid/blob/master/lib/noid/minter.rb#L2-L35).) The state also means that the minter, once it has minted an identifier, will never mint it again so there's no risk of identifier collisions.

Identifier state is tracked in a file that by default is located in a well-known directory in UNIX-like environments, `/tmp/`, but this may be insufficient in production-like environments where `/tmp/` may be aggressively cleaned out. To prevent the chance of identifier collisions, it is recommended that you find a more suitable filesystem location for your system environment. If you are deploying via Capistrano, that location should **not** be in your application directory, which will change on each deployment. If you have multiple instances of your Sufia application, for instance in load-balanced scenarios, you will want to choose a filesystem location that all instances can access. You may change this by altering this line in `config/initializers/sufia.rb`:

`# config.minter_statefile = '/tmp'`

### Web server

The web server provided by Rails (whether that's WEBrick, Unicorn, or another) is not built to scale out very far, so you should consider alternatives such as Passenger with Apache httpd or nginx.

### Database

The database provided by default is SQLite, and you may wish to swap in something built more for scale like PostgreSQL or MySQL, both of which have been used in other production Sufia applications.

## Monitor background workers

Edit `config/initializers/resque_admin.rb` so that `ResqueAdmin#matches?` returns a `true` value for the user(s) who should be able to access this page. One fast way to do this is to return `current_user.admin?` and add an `admin?` method to your user model which checks for specific emails.

Then you can view jobs at the `/admin/queues` route.

## Audiovisual transcoding

Sufia includes support for transcoding audio and video files.  To enable this, make sure to have ffmpeg > 1.0 installed.

On OSX, you can use homebrew for this.

```
brew install ffmpeg --with-fdk-aac --with-libvpx --with-libvorbis
```

To compile ffmpeg yourself, see https://trac.ffmpeg.org/wiki/CompilationGuide

## User interface

**Remove** turbolinks support from `app/assets/stylesheets/application.css` if present:

```
//= require turbolinks
```

Turbolinks causes the dynamic content editor not to load.

## Integration with Dropbox, Box, etc.

Sufia provides built-in support for the [browse-everything](https://github.com/projecthydra/browse-everything) gem, which provides a consolidated file picker experience for selecting files from [DropBox](http://www.dropbox.com),
[Skydrive](https://skydrive.live.com/), [Google Drive](http://drive.google.com),
[Box](http://www.box.com), and a server-side directory share.

To activate browse-everything in your sufia app, run the browse-everything config generator

```
rails g browse_everything:config
```

This will generate a file at _config/browse_everything_providers.yml_. Open that file and enter the API keys for the providers that you want to support in your app.  For more info on configuring browse-everything, go to the [project page](https://github.com/projecthydra/browse-everything) on github.

After running the browse-everything config generator and setting the API keys for the desired providers, an extra tab will appear in your app's Upload page allowing users to pick files from those providers and submit them into your app's repository.

**If your config/initializers/sufia.rb was generated with sufia 3.7.2 or earlier**, then you need to add this line to an initializer (probably _config/initializers/sufia.rb _):
```ruby
config.browse_everything = BrowseEverything.config
```

## Analytics and usage statistics

Sufia provides support for capturing usage information via Google Analytics and for displaying usage stats in the UI.

### Capturing usage

To enable the Google Analytics javascript snippet, make sure that `config.google_analytics_id` is set in your app within the `config/initializers/sufia.rb` file. A Google Analytics ID typically looks like _UA-99999999-1_.

### Displaying usage in the UI

To display data from Google Analytics in the UI, first head to the Google Developers Console and create a new project:

https://console.developers.google.com/project

Let's assume for now Google assigns it a project ID of _foo-bar-123_. It may take a few seconds for this to complete (watch the Activities bar near the bottom of the browser).  Once it's complete, enable the Google+ and Google Analytics APIs here (note: this is an example URL -- you'll have to change the project ID to match yours):

https://console.developers.google.com/project/apps~foo-bar-123/apiui/api

Finally, head to this URL (note: this is an example URL -- you'll have to change the project ID to match yours):

https://console.developers.google.com/project/apps~foo-bar-537/apiui/credential

And create a new OAuth client ID.  When prompted for the type, use the "Service Account" type.  This will give you the OAuth client ID, a client email address, a private key file, a private key secret/password, which you will need in the next step.

Then run this generator:

```
rails g sufia:usagestats
```

The generator will create a configuration file at _config/analytics.yml_.  Edit that file to reflect the information that the Google Developer Console gave you earlier, namely you'll need to provide it:

* The path to the private key
* The password/secret for the privatekey
* The OAuth client email
* An application name (you can make this up)
* An application version (you can make this up)

Lastly, you will need to set `config.analytics = true` and `config.analytic_start_date` in _config/initializers/sufia.rb_ and ensure that the OAuth client email
has the proper access within your Google Analyics account.  To do so, go to the _Admin_ tab for your Google Analytics account.
Click on _User Management_, in the _Account_ column, and add "Read & Analyze" permissions for the OAuth client email address.

## Zotero integration

Integration with Zotero-managed publications is possible using [Arkivo](https://github.com/inukshuk/arkivo). Arkivo is a Node-based Zotero subscription service that monitors Zotero for changes and will feed those changes to your Sufia-based app. [Read more about this work.](https://www.zotero.org/blog/feeds-and-institutional-repositories-coming-to-zotero/)

To enable Zotero integration, first [register an OAuth client with Zotero](https://www.zotero.org/oauth/apps), then [install and start Arkivo-Sufia](https://github.com/inukshuk/arkivo-sufia) and then generate the Arkivo API in your Sufia-based application:

```
rails g sufia:arkivo_api
```

The generator does the following:

* Enables the API in the Sufia initializer
* Adds a database migration
* Creates a routing constraint that allows you to control what clients can access the API
* Copies a config file that allows you to specify the host and port Arkivo is running on
* Copies a config file for your Zotero OAuth client credentials

Update your database schema with `rake db:migrate`.

Add unique Arkivo tokens for each of your existing user accounts with `rake sufia:user:tokens`. (New users will have tokens created as part of the account creation process.)

Edit the routing constraint in `config/initializers/arkivo_constraint.rb` so that your Sufia-based app will allow connections from Arkivo. **Make sure this is restrictive as you are allowing access to an API that allows creates, updates and deletes.**

Tweak `config/arkivo.yml` to point at the host and port your instance of Arkivo is running on.

Tweak `config/zotero.yml` to hold your Zotero OAuth client key and secret. Alternatively, if you'd rather not paste these into a file, you may use the environment variables `ZOTERO_CLIENT_KEY` and `ZOTERO_CLIENT_SECRET`.

Restart your app and it should now be able to pull in Zotero-managed publications on behalf of your users.  Each user will need to link their Sufia app account with their Zotero accounts, which can be done in the "Edit Profile" page. After the accounts are linked, Arkivo will create a subscription to that user's Zotero-hosted "My Publications" collection. When users add items to their "My Publications" collection via the Zotero client, they will automatically be pushed into the Sufia-based repository application. Updates to these items will trigger updates to item metadata in your app, and deletes will delete the files from your app.

## Tag Cloud

Sufia provides a tag cloud on the home page.  To change which field is displayed in that cloud, change the value of `config.tag_cloud_field_name` in the `blacklight_config` section of your CatalogController.  For example:

```ruby
configure_blacklight do |config|
  ...

  # Specify which field to use in the tag cloud on the homepage.
  # To disable the tag cloud, comment out this line.
  config.tag_cloud_field_name = Solrizer.solr_name("tag", :facetable)
end
```

If your CatalogController was generated by a version of Sufia older than 3.7.3 you need to add that line to the Nlacklight configuration in order to make the tag cloud appear.

The contents of the cloud are retrieved as JSON from Blacklight's CatalogController#facet method.  If you need to change how that content is returned (ie. if you need to limit the number of results), override the `render_facet_list_as_json` method in your CatalogController.

## Customizing metadata

Chances are you will want to customize the default metadata provided by Sufia.  Here's [a guide](https://github.com/projecthydra/sufia/wiki/Customizing-Metadata) to help you with that

## Admin Users

### One time setup for first admin

Follow the directions for [installing hydra-role-management](https://github.com/projecthydra/hydra-role-management#installing).

Add the following gem to Sufia installed app's Gemfile
```ruby
gem "hydra-role-management"
```

Then install the gem, run the generator, and database migrations:
```
# each of these commands will produce some output.
bundle install
rails generate roles
rake db:migrate
```

### Adding an admin user

In rails console, run the following commands to create the admin role.
```
r = Role.create name: "admin"
```

Add a user as the admin.
```
r.users << User.find_by_user_key( "your_admin_users_email@fake.email.org" )
r.save
```

Confirm user was made an admin.
```
u = User.find_by_user_key( "your_admin_users_email@fake.email.org" )
u.admin?
  # shows SELECT statment
 => true

if u.admin? == true then SUCCESS
```

Confirm in browser

* go to your Sufia install
* login as the admin user
* add /roles to the end of the main URL

SUCCESS will look like...

* you don't get an error on the /roles page
* you see a button labeled "Create a new role"

## Migrating data to PCDM in Sufia 7

**WARNING: THIS IS IN PROGRESS AND UNTESTED**

1. Create a GenericWork for each GenericFile. The new GenericWork should have the same id as the old GenericFile so that URLs that users have saved will route them to the appropriate location.
1. Create a FileSet for each GenericWork and add it to the `ordered_members` collection on the GenericWork.
1. Move the binary from `GenericFile#content` to `FileSet#original_file`

# License

Sufia is available under [the Apache 2.0 license](LICENSE.md).

# Contributing

We'd love to accept your contributions.  Please see our guide to [contributing to Sufia](CONTRIBUTING.md).

If you'd like to help the development effort and you're not sure where to get started, you can always grab a ticket in the "Ready" column from our [Waffle board](https://waffle.io/projecthydra/sufia). There are other ways to help, too.

* [Contribute a user story](https://github.com/projecthydra/sufia/issues/new).
* Help us improve [Sufia's test coverage](https://coveralls.io/r/projecthydra/sufia) or [documentation coverage](https://inch-ci.org/github/projecthydra/sufia).
* Refactor away [code smells](https://codeclimate.com/github/projecthydra/sufia).

# Development

This information is for people who want to modify the engine itself, not an application that uses the engine:

## Regenerating the README TOC

[Install the gh-md-toc tool](https://github.com/ekalinin/github-markdown-toc/blob/master/README.md#installation), then ensure your README changes are up on GitHub, and then run:

`gh-md-toc https://github.com/USERNAME/sufia/blob/BRANCH/README.md`

That will print to stdout the new TOC, which you can copy into `README.md`, commit, and push.

## Run the test suite

The test suite also requires [PhantomJS](http://phantomjs.org/), version 1.9.x.

```
rake jetty:start
redis-server
rake engine_cart:clean
rake engine_cart:generate
rake spec
```

## Change validation behavior

To change what happens to files that fail validation add an after_validation hook
```
    after_validation :dump_infected_files

    def dump_infected_files
      if Array(errors.get(:content)).any? { |msg| msg =~ /A virus was found/ }
        content.content = errors.get(:content)
        save
      end
    end
```

# Acknowledgments

This software has been developed by and is brought to you by the Hydra community.  Learn more at the
[Project Hydra website](http://projecthydra.org)

![Project Hydra Logo](http://sufia.io/assets/images/hydra_logo.png)
