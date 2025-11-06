using System.ComponentModel.DataAnnotations;

namespace MINSUE_ProHub.Models
{
    public class Reservation
    {
        public int ReservationId { get; set; }
        public string StudentName { get; set; }
        public string StudentId { get; set; }
        public string Email { get; set; }
  public string YearLevel { get; set; }
  public int ProductId { get; set; }
        public int QuantityOrder { get; set; }
        public DateTime DateToClaim { get; set; }
        public string UserId { get; set; }
    }
}