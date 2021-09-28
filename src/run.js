// norime padaryti jog butu readline
import * as readline from "readline";
// cia padarome jog info perkeliama pagal module standarta
import * as mysql from "mysql";

// cia susikureme readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function input(msg) {
    return new Promise((resolve) => {
        rl.question(msg, (txt) => {
            resolve(txt);
        });
    });
}

// cia padarome prisijungima prie duomenu bazes
const OPTIONS = {
    host: 'localhost',
    user: 'apskaita',
    password: 'apskaita',
    database: 'zmones',
    // tam kad apsaugoti nuo injection attack'u
    multipleStatements: true,

};
// sukuriama funkcija connect , kuri grazins promisa resolve ir reject. Cia darome tam kad butu galima naudoti async/await
function connect() {
    return new Promise((resolve, reject) => {
        let conn = mysql.createConnection(OPTIONS);
        conn.connect(err => {
            if (err) {
                return reject(err);
            }
            resolve(conn);
        });
    });
}

function query(conn, sql, values) {
    return new Promise((resolve, reject) => {
        conn.query({
            sql,
            values
        }, (err, results, fields) => {
            if (err) {
                return reject(err);
            }
            resolve({ results, fields });
        });
    });
}
// sukuriama funkcija bandand atsijungti
function end(conn) {
    return new Promise((resolve, reject) => {
        conn.end(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function printResults({ results, fields }) {
    if (Array.isArray(fields) && Array.isArray(results)) {
        let header = "";
        for (const field of fields) {
            header += field.name + "\t";
        }
        console.log(header);
        for (const row of results) {
            let rowStr = "";
            for (const field of fields) {
                rowStr += row[field.name] + "\t";
            }
            console.log(rowStr);
        }
    }
}

// PROGRAMA:

let choise;
while (choise !== 0) {
    console.log("1. Visi zmones");
    console.log("2. Naujas zmogus");
    console.log("3. Istrinti zmogu");
    console.log("4. Visi zmogaus adresai");
    console.log("5. Naujas zmogaus adresas");
    console.log("6. Istrinti zmogaus adresa");
    console.log("7. Visi zmogaus kontaktai");
    console.log("8. Naujas zmogaus kontaktas");
    console.log("9. Istrinti zmogaus kontakta");
    console.log("0. Baigti");
    
    choise = parseInt(await input("Pasirink: "));
    let conn;
    let r;
    let id;
    let zmones_id;
    try {
        conn = await connect();
        switch (choise) {
            case 1:
                r = await query(conn, "select * from zmones",);
                printResults(r);
                break;
            case 2:
                let vardas = await input("Ivesk varda: ");
                let pavarde = await input("Ivesk pavarde: ");
                let gim_data = await input("Ivesk gimimo data ('YYYY-MM-DD'): ");
                let alga = await input("Iveska alga: ");
                r = await query(
                    conn, "insert into zmones (vardas, pavarde, gim_data, alga) values (?,?,?,?);", [vardas, pavarde, gim_data, alga]);
                break;
            case 3:
                id = await input("Ivesk id: ");
                id = parseInt(id);
                r = await query(
                    conn,
                    "delete from zmones where id = ?;",
                    [id],
                );
                break;
                case 4:
                id = await input('Ivesk id: ');
                id = parseInt(id);
                r = await query(conn, "select * from adresai where zmones_id =?;", [id]);
                printResults(r);
                break;
                case 5:
                zmones_id = await input("Ivesk id: ");
                zmones_id = parseInt(zmones_id);
                let adresas = await input("Ivesk adresa: ");
                let miestas = await input("Ivesk miesta: ");
                let valstybe = await input("Ivesk valstybe: ");
                let pasto_kodas = await input("Ivesk pasto koda: ");
                r = await query(conn, "insert into adresai (zmones_id, adresas, miestas, valstybe, pasto_kodas) values (?, ?, ?, ?, ?);",
                    [zmones_id, adresas, miestas, valstybe, pasto_kodas]);
                break;
            case 6:
            id = await input("Ivesk id: ");
            id = parseInt(id);
            r = await query(
                conn,
                "delete from adresai where id = ?;",
                [id],
            );
            case 7:
            id = await input("Ivesk id: ");
            id = parseInt(id);
            r = await query(conn, "select * from kontaktai",);
            printResults(r);
            case 8:
                id = await input("Ivesk id: ");
                zmones_id = await input("Ivesk kita id: ");
                let tipas = await input("Ivesk tipa: ");
                let reiksme = await input("Iveska reiksme: ");
                r = await query(
                    conn, "insert into kontaktai (id, zmones_id, tipas, reiksme) values (?,?,?,?);", [id, zmones_id, tipas, reiksme]);
                break;
            case 9:
                id = await input("Ivesk id: ");
                id = parseInt(id);
                r = await query(
                    conn,
                    "delete from kontaktai where id = ?;",
                    [id],
                );
            case 0:
                console.log("Pabaiga");
        }
    } catch (err) {
        console.log("Klaida", err);
    } finally {
        if (conn) {
            try {
                await end(conn);
            } catch (e) {
                // ignored
            }
        }
    }
}


// let id = await input("Ivesk id: ");
// id = parseInt(id);
// let pav = await input("Ivesk kita pavadinima: ");
// let gimimo_data = await input("Ivesk kita data: ");
// gimimo_data = new Date(gimimo_data);

// let conn;
// try {
//   conn = await connect();
//   const r = await query(
//     conn,
//     "update zmones set gimimo_data=?, vardas=? where id=?;",
//     [gimimo_data, pav, id],
//   );
//   console.log(r);
// } catch (err) {
//   console.log("Klaida", err);
// } finally {
//   if (conn) {
//     try {
//       await end(conn);
//     } catch (e) {
//       // ignored
//     }
//   }
// }



// let id = await input("Ivesk id: ");
// id = parseInt(id);
// let conn;
// try {
//   conn = await connect();
//   const r = await query(
//     conn,
//     "delete from zmones where id = ?;",
//     [id],
//   );
//   console.log(r);
// } catch (err) {
//   console.log("Klaida", err);
// } finally {
//   if (conn) {
//     try {
//       await end(conn);
//     } catch (e) {
//       // ignored
//     }
//   }
// }



// let pav = await input("Ivesk pavadinima: ");
// let pavarde = await input("Ivesk pavarde: ");
// let alga = await input("Ivesk alga: ");

// let conn;
// try {
//   conn = await connect();
//   const r = await query(
//     conn,
//     "insert into zmones (pavarde, vardas, alga) values (?, ?,?);",
//     [pavarde, pav, alga],
//   );
//   console.log(r);
// } catch (err) {
//   console.log("Klaida", err);
// } finally {
//   if (conn) {
//     try {
//       await end(conn);
//     } catch (e) {
//       // ignored
//     }
//   }
// }



// let pav = await input("Ivesk ID: ");
// pav = "%" + pav + "%";
// // NIEKADA SITAIP NEREIKTU RASYTI UZKLAUSOS, NES GALES ATAKUOTI HAKERIAI
// // console.log("select * from zmones where vardas = '" + pav + "';");
// let conn;
// try {
//     conn = await connect();
//     const r = await query(conn, "select * from adresai where id like ?;", [pav]);
//     // ? i klaustuma sql istato duomenis, cia nera vykdoma komanda, o tik i keliami duomenys. Duomenys SQL atveju perduodami tik su ? TAIP NEGALIMA DARYTI: where...like '" + pav + "';"
//     printResults(r);
// } catch (err) {
//     console.log("Klaida", err);
// } finally {
//     if (conn) {
//         try {
//             await end(conn);
//             // CONNECTION'US I DUOMENU BAZES REIKIA UZDARINETI BUTINAI
//         } catch (e) {
//             // ignored
//         }
//     }
// }
rl.close();