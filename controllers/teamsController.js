const mongoose = require('mongoose');
const Team = mongoose.model('Team');

/*  
  Checks to see if the signed in user 
  created the team 
*/
const confirmCreator = (team, user) => {
  if (!team.createdBy.equals(user._id)) {
    throw Error('You do not own this team, you must own a team to edit it.');
  }
};

// Forms are weird so building a team is difficult
const buildTeam = (req) => {
  let pokemonTeam = [{}, {}, {}, {}, {}, {}];

  req.body.species.forEach((species, index) => {
    pokemonTeam[index].species = species.trim();
  });

  req.body.nickname.forEach((name, index) => {
    pokemonTeam[index].nickname = name.trim();
  });

  req.body.level.forEach((level, index) => {
    pokemonTeam[index].level = level;
  });

  req.body.ability.forEach((ability, index) => {
    pokemonTeam[index].ability = ability.trim();
  });

  req.body.heldItem.forEach((heldItem, index) => {
    pokemonTeam[index].heldItem = heldItem.trim();
  });

  req.body.move1.forEach((move, index) => {
    if (!pokemonTeam[index].moves) {
      pokemonTeam[index].moves = [];
    }
    pokemonTeam[index].moves.push(move.trim());
  });

  req.body.move2.forEach((move, index) => {
    if (!pokemonTeam[index].moves) {
      pokemonTeam[index].moves = [];
    }
    pokemonTeam[index].moves.push(move.trim());
  });

  req.body.move3.forEach((move, index) => {
    if (!pokemonTeam[index].moves) {
      pokemonTeam[index].moves = [];
    }
    pokemonTeam[index].moves.push(move.trim());
  });

  req.body.move4.forEach((move, index) => {
    if (!pokemonTeam[index].moves) {
      pokemonTeam[index].moves = [];
    }
    pokemonTeam[index].moves.push(move.trim());
  });

  req.body.hp.forEach((hp, index) => {
    pokemonTeam[index].hp = hp;
  });
  req.body.attack.forEach((attack, index) => {
    pokemonTeam[index].attack = attack;
  });
  req.body.defense.forEach((defense, index) => {
    pokemonTeam[index].defense = defense;
  });
  req.body.spAtk.forEach((spAtk, index) => {
    pokemonTeam[index].spAtk = spAtk;
  });
  req.body.spDef.forEach((spDef, index) => {
    pokemonTeam[index].spDef = spDef;
  });
  req.body.speed.forEach((speed, index) => {
    pokemonTeam[index].speed = speed;
  });

  if (req.body.gigantimax) {
    if (req.body.gigantimax.length > 1) {
      if (!req.body.gigantimax.every((val, i, arr) => val === arr[0])) {
        req.body.gigantimax.forEach((gigantimax) => {
          if (gigantimax !== 'X') {
            const index = parseInt(gigantimax);
            pokemonTeam[index].gigantimax = true;
          }
        });
      }
    } else if (req.body.gigantimax.length === 1) {
      if (req.body.gigantimax !== 'X') {
        const index = parseInt(req.body.gigantimax);
        pokemonTeam[index].gigantimax = true;
      }
    }
  }
  return pokemonTeam;
};

/* 
  GET 
  All teams that are public 
  Renders all teams returned, pagination
*/
exports.listTeams = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = page * limit - limit;

  const totalTeamsPromise = Team.find({ public: true }).count();

  const teamsPromise = Team.find({
    public: true,
  })
    .populate('createdBy')
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const [teams, count] = await Promise.all([teamsPromise, totalTeamsPromise]);

  const pages = Math.ceil(count / limit);
  if (!teams.length && skip) {
    res.redirect(`/teams/page/${pages}`);
    return;
  }

  const paginationUrl = 'teams';
  res.render('teams', { title: 'Teams', teams, page, pages, count, paginationUrl });
};

/* 
  GET 
  All teamss that are created by the signed in user
  Renders user's teams, pagination
*/
exports.userTeams = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = page * limit - limit;

  const totalTeamsPromise = Team.find({ createdBy: req.params.id }).count();

  const teamsPromise = Team.find({
    createdBy: req.params.id,
  })
    .populate('createdBy')
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const [teams, count] = await Promise.all([teamsPromise, totalTeamsPromise]);

  const pages = Math.ceil(count / limit);
  if (!teams.length && skip) {
    res.redirect(`/teams/user/${req.params.id}/page/${pages}`);
    return;
  }

  const paginationUrl = `teams/user/${req.params.id}`;
  res.render('teams', { title: 'My Teams', teams, page, pages, count, paginationUrl });
};

// GET editTeam page
exports.addTeam = (req, res) => {
  // Need a blank team for the form
  const newTeam = {
    public: false,
    name: ' ',
  };

  const blankPokemon = {
    species: ' ',
    name: ' ',
    gigantimax: false,
    level: 1,
    ability: ' ',
    heldItem: ' ',
    moves: [' ', ' ', ' ', ' '],
    hp: 1,
    attack: 1,
    defense: 1,
    spAtk: 1,
    spDef: 1,
    speed: 1,
  };

  newTeam.pokemon = [];
  [1, 2, 3, 4, 5, 6].forEach(() => {
    newTeam.pokemon.push(blankPokemon);
  });
  res.render('editTeam', { title: 'Add Team', team: newTeam });
};

/*
  POST
  Creates team, redirects user to All Teams page
*/
exports.createTeam = async (req, res) => {
  req.body.public = req.body.public === 'on' ? true : false;

  let newTeam = {
    name: req.body.name,
    public: req.body.public,
    createdBy: req.user._id,
    created: Date.now(),
    lastEdited: Date.now(),
  };

  newTeam.pokemon = buildTeam(req);
  const team = await new Team(newTeam).save();

  req.flash('success', `Successfully Created <a href='/teams/${team.slug}'>${team.name}</a> 👍.`);
  res.redirect(`/teams`);
};

/*
  GET
  Gets single team by slug, 
  Populated createdBy to get the creator's username
  Checks to see if the signed in user created the team for View stuff
  Renders single team page
*/
exports.getTeamBySlug = async (req, res, next) => {
  const team = await Team.findOne({ slug: req.params.slug }).populate('createdBy');
  if (!team) return next();
  const currentUserCreated = team.createdBy.equals(req.user._id);
  res.render('team', { team, currentUserCreated, title: team.name });
};

/*
  GET
  Gets single team by id, confirms signed in user created it
  Renders editTeam page
*/
exports.editTeam = async (req, res) => {
  const team = await Team.findOne({ _id: req.params.id });
  confirmCreator(team, req.user);
  res.render('editTeam', { title: `Edit ${team.name}`, team });
};

/*
  POST
  Updates team with data in body
  Renders all Teams page & flash
*/
exports.updateTeam = async (req, res) => {
  req.body.public = req.body.public === 'on' ? true : false;

  let updatedTeam = {
    name: req.body.name,
    public: req.body.public,
    createdBy: req.user._id,
    lastEdited: Date.now(),
  };

  updatedTeam.pokemon = buildTeam(req);
  const team = await Team.findOneAndUpdate({ _id: req.params.id }, updatedTeam, {
    new: true,
    runValidators: true,
  }).exec();
  req.flash(
    'success',
    `Successfully updated <strong>${team.name}</strong>.
      <a href="/team/${team.slug}">View Team</a>`
  );
  res.redirect(`/teams`);
};
