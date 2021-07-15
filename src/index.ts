import axios from 'axios';
import csv from 'neat-csv';
import fs from 'fs';
import _ from 'lodash';

const magicQuery = '?%3AbootstrapWhenNotified=true&%3Aembed=true&%3Alanguage=en-US&:embed=y&:showVizHome=n&:apiID=host0#navType=1&navSrc=Parse';

let changedFile: number = 0;

async function downloadTableauCSV(filename: string) {
    try {
        const { data } = await axios({
            method: 'GET',
            responseType: 'blob',
            baseURL: 'https://public.tableau.com/views/DashboardVaksinKemkes',
            url: `/${filename}.csv${magicQuery}`
        })
        return data;
    } catch (error) {
        if(error.response.status == 500) {
            return null
        }
        console.error(error)
        return null
    }
}

async function saveData(filename: string) {
    const data = await downloadTableauCSV(filename);
    if (data == null && data.length == 0) return 
    
    const dataParsed = await csv(data)
    if (!fs.existsSync(`./data/json/${filename}.json`)) {
        await fs.writeFileSync(`./data/csv/${filename}.csv`, data)
        await fs.writeFileSync(`./data/json/${filename}.json`, JSON.stringify(dataParsed))
        return changedFile += 1;
    }

    const existedFile = await JSON.parse(fs.readFileSync(`./data/json/${filename}.json`, 'utf-8'))

    if(_.isEqual(dataParsed, existedFile)) {
        return console.log(`Skipped ${filename}`)
    }else {
        try {
            await fs.writeFileSync(`./data/csv/${filename}.csv`, data)
            await fs.writeFileSync(`./data/json/${filename}.json`, JSON.stringify(dataParsed))
        } catch (error) {
            console.log(error)
        }
        return changedFile += 1;
    }
}

const filenameArr: string[] = ["Vaksin-ProvincePage", "Vaksin-SasaranTahap1dan2", "rasiodivaksin", "TotalVaksinasiDosis1", "TotalVaksinasiDosis2", "MapbyProvince", "MapbyDistrict", "Map-District", "TenagaKesehatan", "Lansia", "KelompokUsia1217tahun", "MasyarakatRentanMasyarakatUmum", "PelayanPublik", "PelayanPublikV2", "Vaksinpendidik", "TOTALNASIONALVAKSINASIPENDIDIK", "mapvaksin12", "mapvaksin22", "pelaksanaanvaksin1_line2", "pelaksanaanvaksin2_line2", "vaksin_ke1_kabkota", "vaksin_ke2_kabkota", "VaksinPertama2", "VaksinPertama", "JumlahDivaksinPertamaNasionalHariTerakhi2", "VaksinKedua", "JumlahDivaksinKeduaNasional2", "JumlahDivaksinPertamaNasional2", "JumlahDivaksinPertamaNasional3", "Sheet116", "GrafikDivaksinPertamaPerProvinsi2", "GrafikDivaksinPertamaPerKabKota2", "TimeSeriesPelaksanaanVaksinasiPertamaPerProvinsi2", "TimeSeriesPelaksanaanVaksinasiPertamaPerProvinsi-Explorer", "TimeSeriesPelaksanaanVaksinasiKeduaPerProvinsi-Explorer", "JumlahDivaksinPertama2", "ListFilter1", "oldJumlahDivaksinPertamaNasional2", "Vaksin-ProvincePage2", "Achievementremaja", "Achievementtahap3", "capaianremaja", "capaianTahap3", "Targetremaja", "TargetTAHAP3", "JmlDivaksinPertamaNasional", "oldJumlahDivaksinKeduaNasionalHariTerakhi2", "JumlahDivaksinKeduaNasionalHariTerakhir", "VaksinasiCOVID-19Hariini-Nasional-cbi", "VaksinasiCOVID-19Hariini-Nasional-cbiperprovinsi", "Vaksin-VaksinPertamaPageByProvince", "rasiovaksin", "Vaksin-SasaranTahap1dan2Sheet", "Vaksin-VaksinKeduaPageByProvince", "Vaksinasiper100", "TargetSasaranVaksinasiTahapIdanII", "VaksinPertama-cbi", "VaksinKedua-cbi", "DashboardPenerimaVaksinPerDaerah", "JumlahDivaksinPertama", "oldJumlahDivaksinKedua", "GrafikDivaksinPertamaPerProvinsi", "oldGrafikDivaksinKeduaPerProvinsi", "GrafikDivaksinPertamaPerKabKota", "JumlahDivaksinPertamaNasional", "oldJumlahDivaksinKeduaNasional", "JumlahDivaksinPertamaNasionalHariTerakhi", "oldJumlahDivaksinKeduaNasionalHariTerakhir", "VaksinasiCOVID-19Hariini-Nasional", "VaksinasiCOVID-19Hariini-PerDaerah", "backupVaksinKedua", "progressVaksinasinakesdosisI", "scorecardnakesdosisI", "progressVaksinasinakesdosis2", "scorecardnakesdosis2", "oldLansia", "progressVaksinasilansiadosis1", "progressVaksinasiremajadosis1", "progressVaksinasitahap3dosis1", "scorecardLansiadosisI", "scorecardremajadosisI", "scorecardtahap3dosisI", "progressVaksinasilansiadosis2", "progressVaksinasiremajadosis2", "progressVaksinasitahap3dosis2", "scorecardLansiadosisII", "scorecardtahap3dosisII", "scorecardremajadosisII", "scorecardtahap3dosisII_1", "oldPelayanPublik", "progressVaksinasipelayanpublikdosis1", "scorecardpelayanpublikdosisI", "scorecardpelayanpublikdosisIv2", "scorecardpendidikdosisI", "progressVaksinasipelayanpublikdosis2", "scorecardpelayanpublikdosis2", "scorecardpelayanpublikdosis2v2", "scorecardpendidikdosis2", "TimeSeriesPelaksanaanVaksinasiKeduaPerProvinsi2_1", "Sheet120", "Sheet129"]

(async() => {
    for(const file of filenameArr) {
        console.log(`Try file: ${file}`)
        await saveData(file)
    }

    if(changedFile != 0) {
        try {
            fs.writeFileSync('./data/lastCron.txt', (new Date()).toISOString())
        } catch (error) {
            console.log(error)            
        }
    }
})()
