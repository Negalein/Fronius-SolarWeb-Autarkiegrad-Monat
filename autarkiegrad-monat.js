/**
 * -----------------------------------------------------------------------------
 * Fronius SolarWeb Monatsautarkiegrad
 * -----------------------------------------------------------------------------
 * Version:     1.0.0
 * Author:      Christian Wimmer
 * Copyright:   (c) 2026 Christian Wimmer
 * License:     MIT
 *
 * Description:
 * Berechnet den Monatsautarkiegrad einer Fronius PV-Anlage anhand der
 * Tageswerte des Fronius SolarWeb Adapters.
 *
 * Der Autarkiegrad wird vom 1. Tag des aktuellen Monats bis zum heutigen
 * Tag berechnet und in folgenden Datenpunkt geschrieben:
 *
 *   0_userdata.0.Fronius.MonatsAutarkiegrad
 *
 * Formel:
 *
 *   (Σ EnergyDirectConsumption + Σ EnergyBattDischarge)
 *   --------------------------------------------------- * 100
 *              Σ EnergyConsumptionTotal
 *
 * Beispiel:
 *
 *   Tag 1 + Tag 2 + ... + Heute
 *
 * Aktualisierung:
 *
 *   Alle 15 Minuten
 *
 * Voraussetzungen:
 *
 *   - ioBroker JavaScript Adapter
 *   - Fronius SolarWeb Adapter
 *
 * Changelog:
 *
 *   v1.0.0
 *   - Erste Veröffentlichung
 * -----------------------------------------------------------------------------
 */

const VERSION = '1.0.0';

const base =
    'fronius-solarweb.0.6f41428b-0208-4f01-ab38-c11b57543b46.day';

const dpResult =
    '0_userdata.0.Fronius.MonatsAutarkiegrad';

log(`Fronius Monatsautarkiegrad v${VERSION} gestartet`, 'info');

// Datenpunkt anlegen
if (!existsState(dpResult)) {
    createState(dpResult, 0, {
        name: 'PV Monatsautarkiegrad',
        type: 'number',
        role: 'value.percent',
        unit: '%',
        read: true,
        write: false
    });
}

/**
 * Liest einen Datenpunkt.
 * Existiert dieser nicht oder enthält keinen gültigen Wert,
 * wird 0 zurückgegeben.
 */
function getValue(dp) {

    if (!existsState(dp)) {
        return 0;
    }

    const state = getState(dp);

    if (!state || state.val === null || state.val === undefined) {
        return 0;
    }

    const value = parseFloat(state.val);

    return isNaN(value) ? 0 : value;
}

/**
 * Berechnet den Monatsautarkiegrad.
 */
function calculateMonatsAutarkie() {

    const today = new Date().getDate();

    let consumptionSum = 0;
    let directSum = 0;
    let batterySum = 0;

    for (let day = 1; day <= today; day++) {

        consumptionSum += getValue(
            `${base}.EnergyConsumptionTotal.values.${day}`
        );

        directSum += getValue(
            `${base}.EnergyDirectConsumption.values.${day}`
        );

        batterySum += getValue(
            `${base}.EnergyBattDischarge.values.${day}`
        );
    }

    let autarkie = 0;

    if (consumptionSum > 0) {
        autarkie =
            ((directSum + batterySum) / consumptionSum) * 100;
    }

    autarkie = Math.round(autarkie * 10) / 10;

    setState(dpResult, autarkie, true);

    log(
        `Monatsautarkie: ${autarkie}% | Verbrauch=${(consumptionSum / 1000).toFixed(2)} kWh | Direkt=${(directSum / 1000).toFixed(2)} kWh | Batterie=${(batterySum / 1000).toFixed(2)} kWh`,
        'info'
    );
}

// Alle 15 Minuten aktualisieren
schedule('*/15 * * * *', calculateMonatsAutarkie);

// Beim Start sofort berechnen
calculateMonatsAutarkie();
