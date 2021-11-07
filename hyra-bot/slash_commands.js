const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const CONFIG = require('./config.json');
const {Classes} = require('./classes');

const classesChoises = Object.keys(Classes)
    .filter(id => ! Classes[id].hidden)
    .map(id => [Classes[id].name, id]);

const slash_commands = [
    new SlashCommandBuilder().setName("gear")
        .setDescription('Fournis ton ilvl pour pouvoir être sélectionné pour les CvC')
        .addSubcommand(sub =>
            sub.setName("edit")
                .setDescription("Edit ton profile")
                .addStringOption(opt =>
                    opt.setName("character_name")
                        .setDescription("Le nom de ton personnage en jeu")
                        .setRequired(false)
                )
                .addStringOption(opt =>
                    opt.setName("ilvl")
                        .setDescription("Le niveau de ton ilvl sur ton perso")
                        .setRequired(false)
                )
                .addStringOption(opt =>
                    opt.setName("lvl")
                        .setDescription("Le niveau de ton ilvl")
                        .setRequired(false)
                )
                .addStringOption(opt =>
                    opt.setName("class")
                        .setDescription("Ta classe")
                        .addChoices(classesChoises)
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
        sub.setName("screen")
            .setDescription("Ajoute un screen des stats de ton perso")
            .addStringOption(opt =>
                opt.setName("url")
                    .setDescription("l'url du screen")
                    .setRequired(true)
            )
    )
    ,
    new SlashCommandBuilder().setName('profile')
        .setDescription('Affiche le profile d\'un membre du clan')
        .addUserOption(option =>
            option.setName('cible')
                .setDescription('Le joueur ciblé')
                .setRequired(false)
        )
    ,
    new SlashCommandBuilder().setName("roster")
        .setDescription("Gere le roster")
        .addSubcommand(subcommandGroup => {
            return subcommandGroup.setName("search")
                .setDescription("Cherche les joueurs inscrit dans la base")
                .addStringOption(option =>
                    option.setName("classe")
                        .setDescription("Filtrer par classes")
                        .setRequired(false)
                        .addChoices(classesChoises)
                )
                .addIntegerOption(option =>
                    option.setName("min_ilevel")
                        .setDescription("Ilevel minimum")
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName("min_lvl")
                        .setDescription("Level minimum")
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName("sort_by_lvl")
                        .setDescription("Permet de préciser la direction du tri par niveau")
                        .addChoices([['Croissant', 'asc'],['Décroissant','desc']])
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName("sort_by_ilvl")
                        .setDescription("Permet de préciser la direction du tri par niveau d'objet")
                        .addChoices([['Croissant', 'asc'],['Décroissant','desc']])
                        .setRequired(false)
                )
            }
        )
    ,
    new SlashCommandBuilder().setName('help').setDescription('Affiche l\'aide'),

]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(CONFIG.BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(CONFIG.clientId, CONFIG.guildId), { body: slash_commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);