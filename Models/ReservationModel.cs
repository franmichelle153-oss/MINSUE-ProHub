using System.ComponentModel.DataAnnotations;

namespace MINSUE_ProHub.Models
{
    public class ReservationModel
    {
        public int ReservationId { get; set; }

        [Required(ErrorMessage = "Student Name is required")]
        [StringLength(100, ErrorMessage = "Student Name cannot exceed 100 characters")]
        public string StudentName { get; set; }

        [Required(ErrorMessage = "Student ID is required")]
        [RegularExpression(@"^[A-Za-z]{3}\d{4}-\d{5}$", ErrorMessage = "Student ID must be in format MMC2024-00123")]
        public string StudentId { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Year Level is required")]
        public string YearLevel { get; set; }

        [Required(ErrorMessage = "Product ID is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid product")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Quantity is required")]
        [Range(1, 100, ErrorMessage = "Please enter a quantity between 1 and 100")]
        public int QuantityOrder { get; set; }

        [Required(ErrorMessage = "Date to Claim is required")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [FutureDate(ErrorMessage = "Date to Claim must be a future date")]
        public DateTime DateToClaim { get; set; }
    }

    public class FutureDateAttribute : ValidationAttribute
    {
        public override bool IsValid(object value)
        {
            if (value is DateTime date)
            {
                return date.Date >= DateTime.Today;
            }
            return false;
        }
    }
}
