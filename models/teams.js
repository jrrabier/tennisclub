/**
 * Query to add a team
 * @param newTeam the team to add
 * @param callback 
 */
module.exports.addTeam = (newTeam, callback) => {
    var req = 'INSERT INTO tcselles.teams SET ?';

    connection.query(req, newTeam, (err, result) => {
        if (err) {
            throw err;
        }
        callback(null, result);
    });
}

/**
 * Query to get all the teams
 * @param callback 
 */
module.exports.getAllTeams = (callback) => {
    var req = 'SELECT t.id, nb, t.sex, lastname, firstname, label ' + 
    'FROM tcselles.teams t ' +
    'LEFT JOIN tcselles.users u ON users_id = u.id ' + 
    'LEFT JOIN tcselles.categories cat ON categories_id = cat.id';

    connection.query(req, (err, result) => {
        if (err) {
            throw err;
        }
        callback(null, result);
    });
}

/**
 * Query to get a team
 * @param id team's id to get
 * @param callback 
 */
module.exports.getTeam = (id, callback) => {
    var req = 'SELECT t.id, nb, t.sex, lastname, firstname, label ' +
    'FROM tcselles.teams t ' +
    'LEFT JOIN tcselles.users u ON users_id = u.id ' +
    'LEFT JOIN tcselles.categories cat ON categories_id = cat.id ' +
    'WHERE t.id = ?';

    connection.query(req, id, (err, result) => {
        if (err) {
            throw err;
        }
        callback(null, result);
    });
}

/**
 * Query to update a team
 * @param updatedTeam team to update
 * @param callback 
 */
module.exports.updateTeam = (updatedTeam, callback) => {
    var req = "UPDATE tcselles.teams SET ? WHERE id=?";

    connection.query(req, [updatedTeam, updatedTeam.id], (err, result) => {
        if (err) {
            throw err;
        }
        callback(null, result);
    });
}

/**
 * Query to delete a team
 * @param id team's id to delete
 * @param callback 
 */
module.exports.deleteTeam = (id, callback) => {
    var req = "DELETE FROM tcselles.teams WHERE id=?";

    connection.query(req, id, (err, result) => {
        if (err) {
            throw err;
        }
        callback(null, result);
    });
}

module.exports.isTeamExist = (team) => {
    return new Promise((resolve, reject) => {
        let req = 'SELECT id, nb, sex, users_id, categories_id FROM tcselles.teams WHERE nb=? AND sex=? AND categories_id=?';
    
        connection.query(req, [team.nb, team.sex, team.categories_id], (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    })
}