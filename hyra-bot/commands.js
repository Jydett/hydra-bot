const { client } = require("./client.js")
const {ProfileDAO} = require('./profileDAO');
const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const User = require('./user');
const {Classes} = require('./classes');

const timeout = 30000;

const ERROR_EMOJI = ":poop:";

exports.register = function () {
    client.on('interactionCreate', async interaction => {
        if (! interaction.isCommand()) return;

        const { commandName } = interaction;
        const senderId = interaction.user.id;

        // if (commandName === 'help') {
        //     await replyNotImplemented();//TODO faire l'aide
        // } else
        if (commandName === 'profile') {
            const target = interaction.options.getUser('cible');
            const targetId = target ? target.id : senderId;

            const user = ProfileDAO.fromId(targetId);
            if (! user) {
                const response = []
                if (senderId === targetId) {

                    const buttonId = Math.random().toFixed(5) + ''

                    const filter = i => i.customId === buttonId && i.user.id === targetId;

                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: timeout, maxProcessed: 1 });

                    collector.on('collect', async i => {
                        ProfileDAO.users[targetId] = new User(targetId, i.user.username)
                        await i.update({ content: 'A fake user was created', components: [] });
                    });

                    collector.on('end', async collected => {
                        await response[0].editReply({ content: 'Expiré', components: []})
                    });

                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId(buttonId)
                                .setLabel('Oui')
                                .setStyle('SUCCESS')
                        )
                    response[0] = interaction
                    await interaction.reply({ content: ERROR_EMOJI + ' Vous n\'êtes pas dans la base de données, voulez vous vous inscrire ?', components: [row], ephemeral: true})
                } else {
                    await interaction.reply({ content: ERROR_EMOJI + ' ' + target.username + ' n\'est pas dans la base de données', ephemeral: true})
                }
            } else {
                await interaction.reply({ embeds: [embeddedUser(user)], ephemeral: true })
            }
        } else if (commandName === 'roster') {
            if (interaction.options.getSubcommand() === 'search') {
                const res = new MessageEmbed()
                let desc = ""
                let title = ""

                let elyonClass = interaction.options.getString('classe');
                if (elyonClass) {
                    title = title + elyonClass + ';'
                }
                let min_lvl = interaction.options.getInteger('min_lvl');
                if (min_lvl) {
                    title = title + 'lvl>=' + min_lvl + ';'
                }
                let min_ilevel = interaction.options.getInteger('min_ilevel');
                if (min_ilevel) {
                    title = title + 'ilvl>=' + min_ilevel + ';'
                }


                let selectedUsers = Object.keys(ProfileDAO.users)
                    .map(k => ProfileDAO.users[k])
                    .filter(u => {
                        if (elyonClass) {
                            if (elyonClass !== u.elyonClass.id) {
                                return false;
                            }
                        }
                        if (min_ilevel) {
                            if (min_ilevel > u.ilvl) {
                                return false;
                            }
                        }
                        if (min_lvl) {
                            if (min_lvl > u.lvl) {
                                return false;
                            }
                        }
                        return true;
                    });

                //TODO check sorting

                let sort_by_lvl = interaction.options.get('sort_by_lvl');
                let sort_by_ilvl = interaction.options.get('sort_by_ilvl');

                //default sort
                if (! sort_by_lvl && ! sort_by_ilvl) {
                    selectedUsers.sort((u1, u2) => {
                        let res = u2.lvl - u1.lvl
                        if (res === 0) {
                            res = u2.ilvl - u1.ilvl
                        }
                        return res;
                    });
                } else {
                    if (sort_by_lvl) {
                        selectedUsers.sort((u1, u2) => {
                            if (sort_by_lvl === 'asc') {
                                return u1.lvl - u2.lvl;
                            } else {
                                return u2.lvl - u1.lvl;
                            }
                        });
                    }
                    if (sort_by_ilvl) {
                        selectedUsers.sort((u1, u2) => {
                            if (sort_by_ilvl === 'asc') {
                                return u1.ilvl - u2.ilvl;
                            } else {
                                return u2.ilvl - u1.ilvl;
                            }
                        });
                    }
                }
                let noTitle = false;
                let display;
                if (elyonClass) {
                    display = 'rows';
                    noTitle = true;
                    if (title === elyonClass + ';') {
                        res.setAuthor(elyonClass, Classes[elyonClass].imgURL)
                    }
                } else {
                    display = 'line';
                }
                if (display === 'line') {
                    for (let u of selectedUsers) {
                        desc = desc + '**' + u.elyonClass.name + '** ' + u.name + ' (LVL: ' + u.lvl.toString() + ', ILVL: ' + u.ilvl + ')\n';
                    }
                    res.setDescription(desc)
                } else {
                    let nameField = '';
                    let lvlField = '';
                    let ilvlField = '';
                    for (let u of selectedUsers) {
                        nameField = nameField + u.name + '\n'
                        lvlField = lvlField + u.lvl + '\n'
                        ilvlField = ilvlField + u.ilvl + '\n'
                    }
                    res.addFields(
                        {name: 'Nom', value: nameField, inline: true},
                        {name: 'Lvl', value: lvlField, inline: true},
                        {name: 'Ilvl', value: ilvlField, inline: true},
                    )
                }
                if (! noTitle) {
                    if (title.length === 0) {
                        title = "*;"
                    }
                    res.setTitle(title.slice(0, -1));
                }
                interaction.reply({ embeds: [res]});
            }
        } else if (commandName === 'gear') {
            if (interaction.options.getSubcommand() === 'screen') {
                let url = interaction.options.getString('url');
                let tempU = ProfileDAO.users[senderId]
                if (! tempU) {
                    await interaction.reply({content: ERROR_EMOJI + ' Vous n\êtes pas dans la base. Faites /gear edit pour vous inscrire', ephemeral: true})
                    return;
                }
                updatePict(tempU, url);
                await interaction.reply({embeds: [embeddedUser(tempU, true)]});
            } else if (interaction.options.getSubcommand() === 'edit') {

                console.log(interaction.options)

                let valid = false;
                let userName = interaction.options.getString('character_name');

                let tempU = ProfileDAO.users[senderId]
                if (! tempU) {
                    if (! userName) {
                        await interaction.reply({content: ERROR_EMOJI + ' Vous n\êtes pas dans la base, fournissez au moins votre nom de personnage', ephemeral: true})
                        return;
                    }
                    tempU = new User(senderId, userName);
                }

                if (userName) {
                    valid = true;
                    tempU.name = userName;
                }

                let ilvl = interaction.options.getInteger('ilvl');
                if (ilvl) {
                    valid = true;
                    tempU.ilvl = ilvl;
                }

                let lvl = interaction.options.getInteger('lvl');
                if (lvl) {
                    valid = true;
                    tempU.lvl = lvl;
                }

                let elyonClass = interaction.options.getString('class');
                if (elyonClass) {
                    valid = true;
                    tempU.elyonClass = Classes[elyonClass];
                }

                if (valid) {
                    ProfileDAO.users[senderId] = tempU;
                    await interaction.reply({embeds: [embeddedUser(tempU, true)]});
                } else {
                    await interaction.reply({
                        content: 'Commande non valide, fournissez au moins un argument',
                        ephemeral: true
                    })
                }
            }
        }
    });
}

function embeddedUser(user, updated=false) {
    const message = new MessageEmbed()
        .setTitle(updated ? ':white_check_mark: Profil mis à jour: ' + user.name : '' + user.name)
        .setAuthor(user.elyonClass.name, user.elyonClass.imgURL, null)
        .setDescription("**LVL**: " + (user.lvl === undefined ? '*Pas spécifié*' : user.lvl) +
            "\n**ILVL**: " + (user.ilvl === undefined ? '*Pas spécifié*' : user.ilvl));

    if (user.pictURL) {
        message.setImage(user.pictURL)

            .setFooter('Mis à jour le ' + new Date(user.lastUpdatePict).toLocaleDateString("fr-FR",
                { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' à'), null);
    }
    return message;
}

async function replyNotImplemented(interaction) {
    await interaction.reply({content: ERROR_EMOJI + 'Jydep a pas encore codé ca', ephemeral: true})
}


function updatePict(usr, url) {
    usr.pictURL = url;
    usr.lastUpdatePict = Date.now();
}