module.exports = class Util {
     
    static getDateTimeNow(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var hh = today.getHours();
        var min = today.getMinutes();
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        } 
        if (mm < 10) {
            mm = '0' + mm;
        } 
        var today = dd + '/' + mm + '/' + yyyy + " - "+ hh + ":" + min ;
        return today;
    }
}