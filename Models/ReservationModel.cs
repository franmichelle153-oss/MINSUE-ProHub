using System.ComponentModel.DataAnnotations;

namespace MINSUE_ProHub.Models
{
    public class ReservationModel
    {
        public int ReservationId { get; set; }
   
        [Required]
        public string StudentName { get; set; }

        [Required]
        public string StudentId { get; set; }
      
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string YearLevel { get; set; }
    
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int QuantityOrder { get; set; }
        
        [Required]
        public DateTime DateToClaim { get; set; }
    }
}
