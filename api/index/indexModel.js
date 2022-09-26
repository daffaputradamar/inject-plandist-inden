const sql = require('mssql')
const config = require('../../config/db')

function genQuery(siteid, indents) {
    const _indents = indents.map(i => `'${i}'`)
    if (process.env.INJECT == 'true') {
        return `
            DECLARE @GUDANG nvarchar(10) = '${siteid}'
            DECLARE @TGLDISTPLAN DATE = CONVERT(DATE, GETDATE())

            IF OBJECT_ID('tempdb.dbo.#HDRNYA', 'U') IS NOT NULL
            DROP TABLE dbo.#HDRNYA
    
            select distinct 
            LEFT(b.NOPO, 3) KODE_CABANG,
            a.MGR_WIL MGR_WIL, 
            '-' NO_POD, 
            'admin' CREA_BY, 
            convert(date, getdate()) CREA_DATE,
            null MODI_BY,
            null MODI_DATE,
            convert(date, getdate()) TGL_PLAN,
            @GUDANG KODE_GUDANG	, 
            1 PERIODE	, 
            month(getdate()) BULAN,
            year(getdate()) TAHUN,
            b.KODETYPE KODE_TYPE,
            b.KODEWARNA KODE_WARNA,
            'Y' PRS	,NULL NM_USER,
            b.KODEDEALER KODE_DEALER,
            0 PROSES,
            null QTY_ITEM_AX,
            null QTY_ITEM_SO_AX	,
            null QTY_ITEM_ADJ_KREDIT,
            null QTY_ITEM_ADJ_TUNAI	,
            null QTY_ITEM_ADJ_KREDIT_AWAL,
            null QTY_ITEM_ADJ_TUNAI_AWAL,
            c.nametype NAMA_TYPE,
            c.namecolor NAMA_WARNA, 
            @GUDANG SITE_ID, 
            0 STATUSSO,
            b.kodedealer NAMA_DEALER,
            a.KD_DLR_AX CUSTOMERID, 
            a.KD_DLR_AX KOTA,
            null TAHUN_PRODUKSI,
            null NOMOR,
            0 QTY_DETAIL,
            0 QTY_PLAN_ADJ,
            null QTY_PO,
            null IS_POSTING_PORTAL
            into #HDRNYA
            FROM MPMAX.dbo.MPMSALINDENT b
            JOIN MPMMKT.dbo.MPMSAL_DEALER_SUPERVISOR a
                on b.KODEDEALER = a.KD_DLR
            join [MPMAX].[dbo].[MPMVIEW_UNITTYPECOLOR_DESCRIPTION] c
                on b.KODETYPE = c.type
                and b.KODEWARNA = c.color	
            left join  [MPMMKT].[dbo].MPMSAL_INDEN_BUKA_SO d
                on b.KODEDEALER = d.KODE_DEALER
                and b.KODETYPE = d.KODE_TYPE
                and b.KODEWARNA = d.KODE_WARNA
                and b.KODEGUDANG = d.KODE_GUDANG
            where 
            d.KODE_DEALER is null
            and 
            b.TEMP_NO_INDEN in(
                ${_indents.join(',')}
            )

            insert into [MPMMKT].[dbo].MPMSAL_INDEN_BUKA_SO(KODE_CABANG,MGR_WIL,NO_POD,CREA_BY	,CREA_DATE	,MODI_BY	,MODI_DATE	,TGL_PLAN	,KODE_GUDANG	,PERIODE	,BULAN	,TAHUN	,KODE_TYPE	,KODE_WARNA	,PRS	,NM_USER	,KODE_DEALER	,PROSES	,QTY_ITEM_AX	,QTY_ITEM_SO_AX	,QTY_ITEM_ADJ_KREDIT	,QTY_ITEM_ADJ_TUNAI	,QTY_ITEM_ADJ_KREDIT_AWAL	,QTY_ITEM_ADJ_TUNAI_AWAL	,NAMA_TYPE	,NAMA_WARNA	,SITE_ID	,STATUSSO	,NAMA_DEALER	,CUSTOMERID	,KOTA	,TAHUN_PRODUKSI	,NOMOR	,QTY_DETAIL	,QTY_PLAN_ADJ	,QTY_PO	,IS_POSTING_PORTAL)
            select b.KODE_CABANG, b.MGR_WIL, b. NO_POD, b.CREA_BY, b.CREA_DATE, b. MODI_BY, b.MODI_DATE, b.TGL_PLAN, b.KODE_GUDANG, b.PERIODE,  b.BULAN, b.TAHUN, b.KODE_TYPE, b.KODE_WARNA, b.PRS, b.NM_USER, b.KODE_DEALER, b.PROSES, b. QTY_ITEM_AX, b.QTY_ITEM_SO_AX	, b.QTY_ITEM_ADJ_KREDIT, b.QTY_ITEM_ADJ_TUNAI	, b.QTY_ITEM_ADJ_KREDIT_AWAL, b. QTY_ITEM_ADJ_TUNAI_AWAL, b. NAMA_TYPE, b.NAMA_WARNA, b.SITE_ID, b.STATUSSO, b.NAMA_DEALER, b.CUSTOMERID, b.KOTA, b.TAHUN_PRODUKSI, b.NOMOR, b.QTY_DETAIL, b.QTY_PLAN_ADJ, b.QTY_PO, b.IS_POSTING_PORTAL
            from #HDRNYA b
            left join  [MPMMKT].[dbo].MPMSAL_INDEN_BUKA_SO d
                on b.KODE_DEALER = d.KODE_DEALER
                and b.KODE_TYPE = d.KODE_TYPE
                and b.KODE_WARNA = d.KODE_WARNA
                and b.KODE_GUDANG = d.KODE_GUDANG
                and d.TGL_PLAN = @TGLDISTPLAN
            where 
            d.KODE_DEALER is null

            INSERT INTO [MPMMKT].[dbo].[MPMSAL_INDEN_BUKA_SO_DETAIL]
            SELECT LEFT(b.NOPO, 3) [KODE_CABANG]
                ,a.MGR_WIL [MGR_WIL]
                ,b.NOPO [NO_POD]
                ,'Admin' [CREA_BY]
                ,getdate() [CREA_DATE]
                ,NULL [MODI_BY]
                ,NULL [MODI_DATE]
                ,convert(date, getdate()) [TGL_PLAN]
                ,@GUDANG [KODE_GUDANG]
                ,1 PERIODE 
                ,month(getdate()) BULAN
                ,year(getdate()) TAHUN
                ,b.KODETYPE [KODE_TYPE]
                ,b.KODEWARNA [KODE_WARNA]
                ,'T' [PRS]
                ,NULL [NM_USER]
                ,b.KODEDEALER [KODE_DEALER]
                ,'T' [PROSES]
                ,1 [QTY_ITEM_AX]
                ,0 [QTY_ITEM_SO_AX]
                ,0 [QTY_ITEM_ADJ_KREDIT]
                ,1 [QTY_ITEM_ADJ_TUNAI]
                ,IIF(b.VKODEFINCOY = 'TUNAI', 0, 1) [QTY_ITEM_ADJ_KREDIT_AWAL]
                ,IIF(b.VKODEFINCOY = 'TUNAI', 1, 0) [QTY_ITEM_ADJ_TUNAI_AWAL]
                ,c.nametype [NAMA_TYPE]
                ,c.namecolor [NAMA_WARNA]
                ,@GUDANG [SITE_ID]
                ,0 [STATUSSO]
                ,b.KODEDEALER [NAMA_DEALER]
                ,a.KD_DLR_AX [CUSTOMERID]
                ,b.[KOTA]
                ,2022 [TAHUN_PRODUKSI]
                ,b.TEMP_NO_INDEN [NOMOR]
                ,@GUDANG + 'STR' [LOCATION_ID]
                ,NULL [QTY_DETAIL]
                ,NULL [NPK]
                ,NULL [QTY_ITEM_BAGI_KREDIT]
                ,NULL [QTY_ITEM_BAGI_TUNAI]
                ,NULL [QTY_ITEM_BAGI_KREDIT_CHARGE]
                ,NULL [QTY_ITEM_BAGI_TUNAI_CHARGE]
            FROM MPMAX..MPMSALINDENT b
            JOIN MPMMKT..MPMSAL_DEALER_SUPERVISOR a
                on b.KODEDEALER = a.KD_DLR
            join [MPMAX].[dbo].[MPMVIEW_UNITTYPECOLOR_DESCRIPTION] c
                on b.KODETYPE = c.type
                and b.KODEWARNA = c.color	
            left join [MPMMKT].[dbo].[MPMSAL_INDEN_BUKA_SO_DETAIL] d
                on b.TEMP_NO_INDEN = d.NOMOR
                and d.TGL_PLAN = @TGLDISTPLAN
            where 
            d.NOMOR is null
            and 
            b.TEMP_NO_INDEN in(
                ${_indents.join(',')}
            )
            
            IF OBJECT_ID('tempdb.dbo.#HDRNYA', 'U') IS NOT NULL
            DROP TABLE dbo.#HDRNYA
        `
    } else {
        return `SELECT 1`
    }
    
}

function injectDB(siteid, indents) {
    return new Promise((resolve, reject) => {
        sql.connect(config)
            .then((pool) => {
                const request = pool.request();
                const query = genQuery(siteid, indents)
                return request.query(query)
            })
            .then(result => {
                console.log(result);
                resolve({
                    siteid,
                    result: result.recordset
                })
            })
            .catch(err => {
                reject(err)
            })
    })
    
}

module.exports = {
    inject: (indentData) => {
        return new Promise((resolve, reject) => {
            const siteids = Object.keys(indentData)
            let promises = []
    
            let data = []
    
            for (const siteid of siteids) {
                promises.push(injectDB(siteid, indentData[siteid]))
            }
            Promise.all(promises)
                .then(res => {
                    data = res
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }    
}