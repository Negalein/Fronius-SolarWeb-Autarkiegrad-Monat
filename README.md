# Fronius SolarWeb Monatsautarkiegrad für ioBroker

Berechnet den Autarkiegrad des laufenden Monats anhand der vom Fronius SolarWeb Adapter bereitgestellten Tageswerte.

Der berechnete Wert wird in folgenden Datenpunkt geschrieben:

```text
0_userdata.0.Fronius.MonatsAutarkiegrad
```

## Funktionsweise

Das Skript summiert automatisch alle Tageswerte vom 1. Tag des aktuellen Monats bis zum heutigen Tag:

* EnergyConsumptionTotal
* EnergyDirectConsumption
* EnergyBattDischarge

Anschließend wird daraus der Monatsautarkiegrad berechnet.

## Formel

```text
(Σ EnergyDirectConsumption + Σ EnergyBattDischarge)
/
Σ EnergyConsumptionTotal
*
100
```

## Voraussetzungen

* ioBroker
* JavaScript Adapter
* Fronius SolarWeb Adapter

## Aktualisierung

Der Wert wird alle 15 Minuten neu berechnet.

## Ausgabe

```text
0_userdata.0.Fronius.MonatsAutarkiegrad
```

## Lizenz

MIT License

Copyright (c) 2026 Christian Wimmer
